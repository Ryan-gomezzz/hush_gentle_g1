export default function IngredientsPage() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl">
      <h1 className="text-4xl font-serif text-sage-900 mb-6">Ingredients</h1>
      <p className="text-sage-600 mb-10">
        A gentle overview of the ingredients we love. This is placeholder content and can be updated with your final copy.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <h3 className="font-serif text-xl text-sage-900 mb-2">Shea Butter</h3>
          <p className="text-sage-700 text-sm">Deeply nourishing and comforting for dry skin.</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <h3 className="font-serif text-xl text-sage-900 mb-2">Almond Oil</h3>
          <p className="text-sage-700 text-sm">Lightweight softness for a calm, hydrated feel.</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <h3 className="font-serif text-xl text-sage-900 mb-2">Vitamin E</h3>
          <p className="text-sage-700 text-sm">Supports the skin barrier and helps lock in moisture.</p>
        </div>
        <div className="bg-white rounded-2xl border border-sage-100 p-6">
          <h3 className="font-serif text-xl text-sage-900 mb-2">Peppermint Oil</h3>
          <p className="text-sage-700 text-sm">A refreshing, cooling note (used in gentle, balanced amounts).</p>
        </div>
      </div>
    </div>
  )
}


