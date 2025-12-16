-- Seed Categories
INSERT INTO public.categories (name, slug, description) VALUES
('Hand Care', 'hand-care', 'Gentle natural care for your hands'),
('Foot Care', 'foot-care', 'Soothing treatments for tired feet'),
('Body Care', 'body-care', 'Luxurious natural body butters'),
('Face Care', 'face-care', 'Delicate formulas for sensitive skin')
ON CONFLICT (slug) DO NOTHING;

-- Seed Products (Updated with Real Images and INR pricing)
INSERT INTO public.products (name, slug, price, stock, category_id, attributes, images, is_featured) VALUES
(
  'Hush Gentle Soothing Hand Butter',
  'soothing-hand-butter',
  499.00,
  100,
  (SELECT id FROM categories WHERE slug = 'hand-care'),
  '{"ingredients": ["Shea Butter", "Almond Oil", "Vitamin E"], "benefits": "Deep hydration for dry hands", "usage": "Apply generously before bed"}',
  '{"/images/hand-butter-1.png"}',
  true
),
(
  'Hush Gentle Peppermint Foot Butter',
  'peppermint-foot-butter',
  599.00,
  85,
  (SELECT id FROM categories WHERE slug = 'foot-care'),
  '{"ingredients": ["Peppermint Oil", "Cocoa Butter", "Lanolin"], "benefits": "Cools and repairs cracked heels", "usage": "Massage onto feet after washing"}',
  '{"/images/hand-butter-2.png"}',
  true
),
(
  'Hush Gentle Tea Tree Deodorant Cream',
  'tea-tree-deodorant',
  349.00,
  120,
  (SELECT id FROM categories WHERE slug = 'body-care'),
  '{"ingredients": ["Tea Tree Oil", "Coconut Oil", "Arrowroot"], "benefits": "Natural odor protection", "usage": "Apply a pea-sized amount to underarms"}',
  '{"/images/hand-butter-1.png"}',
  true
),
(
  'Hush Gentle Magic Dust Blackhead Remover',
  'magic-dust-blackhead',
  899.00,
  50,
  (SELECT id FROM categories WHERE slug = 'face-care'),
  '{"ingredients": ["Activated Charcoal", "Bentonite Clay"], "benefits": "Gently extracts impurities", "usage": "Mix with water and apply as mask"}',
  '{"/images/hand-butter-2.png"}',
  true
),
(
  'Hush Gentle Coconut Massage Body Butter',
  'coconut-massage-butter',
  799.00,
  60,
  (SELECT id FROM categories WHERE slug = 'body-care'),
  '{"ingredients": ["Virgin Coconut Oil", "Jojoba Oil"], "benefits": "Relaxing glide for massage", "usage": "Warm in hands and massage deeply"}',
  '{"/images/hand-butter-1.png"}',
  false
),
(
  'Hush Gentle Eucalyptus Scented Foot Balm',
  'eucalyptus-foot-balm',
  449.00,
  75,
  (SELECT id FROM categories WHERE slug = 'foot-care'),
  '{"ingredients": ["Eucalyptus Oil", "Beeswax", "Olive Oil"], "benefits": "Refreshing relief for sore feet", "usage": "Rub onto soles and ankles"}',
  '{"/images/hand-butter-2.png"}',
  false
),
(
  'Hush Gentle Shih Tzu Thing Foot Repair',
  'shih-tzu-foot-repair',
  649.00,
  40,
  (SELECT id FROM categories WHERE slug = 'foot-care'),
  '{"ingredients": ["Shea Butter", "Lavender Oil"], "benefits": "Intense repair for very dry skin", "usage": "Apply overnight with socks"}',
  '{"/images/hand-butter-2.png"}',
  false
)
ON CONFLICT (slug) DO UPDATE SET
  price = EXCLUDED.price,
  images = EXCLUDED.images,
  attributes = EXCLUDED.attributes,
  stock = EXCLUDED.stock,
  is_featured = EXCLUDED.is_featured;

-- Seed Testimonials
INSERT INTO public.testimonials (author_name, role, content, rating) VALUES
('Sarah M.', 'Verified Buyer', 'Finally a hand butter that doesn''t feel greasy! Smells divine.', 5),
('David K.', 'Verified Buyer', 'My cracked heels are gone after just a week. Highly recommend the foot butter.', 5),
('Elena R.', 'Loyal Customer', 'I love that everything uses natural ingredients. No hidden chemicals.', 5);
