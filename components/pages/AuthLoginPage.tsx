"use client";

import { Suspense } from "react";
import AppLoginContainer from "../elements/AppLoginContainer";

export default function AuthLoginPage() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-50">
      <Suspense fallback={null}>
        <AppLoginContainer />
      </Suspense>
    </div>
  );
}
