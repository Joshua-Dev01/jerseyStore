import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="p-6 md:p-8">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Inventory
      </Link>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Edit Product</h1>
      <p className="text-sm text-gray-500">
        Editing product {id} — this form isn&apos;t built yet.
      </p>
    </div>
  );
}