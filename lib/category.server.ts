export async function fetchCategories() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/category/all`,
    {
      cache: 'force-cache', // categories rarely change
    }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch categories');
  }

  return res.json();
}