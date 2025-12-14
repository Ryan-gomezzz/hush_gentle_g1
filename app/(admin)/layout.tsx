export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen bg-gray-50">
            <aside className="w-64 bg-sage-900 text-white p-6 hidden md:block">
                <h2 className="text-2xl font-serif mb-8">Hush Admin</h2>
                <nav className="flex flex-col gap-4">
                    <a href="/dashboard" className="opacity-80 hover:opacity-100">Overview</a>
                    <a href="/dashboard/products" className="opacity-80 hover:opacity-100">Products</a>
                    <a href="/dashboard/orders" className="opacity-80 hover:opacity-100">Orders</a>
                    <a href="/dashboard/reviews" className="opacity-80 hover:opacity-100">Reviews</a>
                </nav>
            </aside>
            <main className="flex-1 p-8">
                {children}
            </main>
        </div>
    );
}
