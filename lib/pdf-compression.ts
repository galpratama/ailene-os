export async function compressPdf(file: File): Promise<File> {
  const { PDFDocument } = await import("pdf-lib");
  const source = new Uint8Array(await file.arrayBuffer());
  const document = await PDFDocument.load(source, {
    ignoreEncryption: false,
    updateMetadata: false,
  });
  const compressed = await document.save({
    addDefaultPage: false,
    objectsPerTick: 50,
    useObjectStreams: true,
  });

  if (compressed.byteLength >= file.size) return file;

  const output = Uint8Array.from(compressed).buffer;
  return new File([output], file.name, {
    type: "application/pdf",
    lastModified: file.lastModified,
  });
}
