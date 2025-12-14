export default function LoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-offwhite">
            <div className="p-8 bg-white shadow-lg rounded-2xl w-full max-w-md">
                <h1 className="text-3xl font-serif text-center text-sage-900 mb-6">Welcome Back</h1>
                <form className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-sage-500 focus:border-sage-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Password</label>
                        <input type="password" className="mt-1 w-full p-2 border border-gray-300 rounded-lg focus:ring-sage-500 focus:border-sage-500" />
                    </div>
                    <button className="w-full py-3 bg-sage-500 text-white rounded-xl hover:bg-sage-600 transition-colors">
                        Sign In
                    </button>
                </form>
            </div>
        </div>
    );
}
