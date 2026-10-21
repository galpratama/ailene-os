import type { ApiList } from "@/apis/api";
import type { ListPipelinesOptions, PipelineData, PipelineWeekData, PipelineWeekOptions } from "@/apis/sales";
import { requireApiData } from "@/lib/api-result";
import { listPipelines, listPipelineWeeks } from "@/lib/actions";


type PagedLeadsOptions = ListPipelinesOptions & { page: number; page_size: number };

// The API filters one phase per call, so a page borrowing another phase's stage needs one call per source.
function leadSources<T extends Pick<ListPipelinesOptions, "phase" | "stage">>(filters: T): T[] {
  if (filters.stage) return [filters];
  return filters.phase === "bdr"
    ? [{ ...filters, phase: "sdr", stage: "meeting_booked" }, filters]
    : [filters];
}

// Rows [skip, skip + take) of one source, read through the API's fixed-size pages.
async function readRange(filters: ListPipelinesOptions, skip: number, take: number, pageSize: number) {
  if (take === 0) {
    const head = requireApiData(await listPipelines({ ...filters, page: 1, page_size: 1 }));
    return { list: [], total: head.metapaging.total_data };
  }
  const firstPage = Math.floor(skip / pageSize) + 1;
  const lastPage = Math.floor((skip + take - 1) / pageSize) + 1;
  const pages = await Promise.all(
    Array.from({ length: lastPage - firstPage + 1 }, (_, i) =>
      listPipelines({ ...filters, page: firstPage + i, page_size: pageSize }).then(requireApiData)
    )
  );
  const start = skip - (firstPage - 1) * pageSize;
  return {
    list: pages.flatMap((page) => page.list).slice(start, start + take),
    total: pages[0].metapaging.total_data,
  };
}

// Pages through the sources back to back, borrowed stages first, as if they were one list.
export async function listLeadsPage(filters: PagedLeadsOptions): Promise<ApiList<PipelineData>> {
  const sources = leadSources(filters);
  if (sources.length === 1) return requireApiData(await listPipelines(filters));

  const { page, page_size: pageSize } = filters;
  const list: PipelineData[] = [];
  let skip = (page - 1) * pageSize;
  let total = 0;
  for (const source of sources) {
    const part = await readRange(source, skip, pageSize - list.length, pageSize);
    list.push(...part.list);
    total += part.total;
    skip = Math.max(0, skip - part.total);
  }
  return {
    list,
    metapaging: { total_data: total, total_page: Math.ceil(total / pageSize), current_page: page, page_size: pageSize },
  };
}

// Every source answers with the same weeks, so the counts add up week by week.
export async function listLeadWeeks(filters: PipelineWeekOptions): Promise<ApiList<PipelineWeekData>> {
  const results = await Promise.all(
    leadSources(filters).map(async (source) => requireApiData(await listPipelineWeeks(source)))
  );
  const [first, ...rest] = results;
  const list = first.list.map((week) => {
    const matches = rest.map((result) => result.list.find((entry) => entry.week_start === week.week_start));
    return matches.reduce<PipelineWeekData>(
      (sum, entry) => ({
        ...sum,
        total_leads: sum.total_leads + (entry?.total_leads ?? 0),
        inbound_leads: sum.inbound_leads + (entry?.inbound_leads ?? 0),
        outbound_leads: sum.outbound_leads + (entry?.outbound_leads ?? 0),
      }),
      week
    );
  });
  return { list, metapaging: first.metapaging };
}
