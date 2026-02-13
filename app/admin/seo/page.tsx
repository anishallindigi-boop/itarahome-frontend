'use client';

import { useState } from "react";
import SeoForm from "./SeoForm";
import SeoTable from "./SeoTable";

export default function SeoAdminPage() {
  const [editData, setEditData] = useState<any>(null);

  return (
    <div className="p-6 space-y-6">
      <SeoForm
        editData={editData}
        onSuccess={() => setEditData(null)}
      />
      <SeoTable onEdit={setEditData} />
    </div>
  );
}
