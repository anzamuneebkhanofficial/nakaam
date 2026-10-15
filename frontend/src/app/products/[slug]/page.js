import { redirect } from 'next/navigation';

export default async function ProductsSlugRedirect({ params }) {
  const { slug } = await params;
  redirect(`/p/${slug}`);
}
