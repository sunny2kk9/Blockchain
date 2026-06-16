export const productImageList = [
    { id: '1', name: 'Sliced Bread', image: 'https://images.unsplash.com/photo-1592029780368-c1fff15bcfd5?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '2', name: 'Pound cakes', image: 'https://images.unsplash.com/photo-1514435390218-898a0e01517a?q=80&w=1950&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '11', name: 'Croissants', image: 'https://images.unsplash.com/photo-1623334044303-241021148842?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Y3JvaXNzYW50c3xlbnwwfHwwfHx8MA%3D%3D' },
    { id: '4', name: 'White Toast Bread', image: 'https://plus.unsplash.com/premium_photo-1695084221474-ed36627bfaf8?q=80&w=1976&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '5', name: 'Burger bun', image: 'https://images.unsplash.com/photo-1606481793630-0b10bb3bab50?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
    { id: '6', name: 'Garlic Bread', image: 'https://images.unsplash.com/photo-1598785244280-7a428600d053?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Z2FybGljJTIwYnJlYWR8ZW58MHx8MHx8fDA%3D' },
    { id: '7', name: 'Slice Cake', image: 'https://media.istockphoto.com/id/1223879796/photo/tiramisu.jpg?s=2048x2048&w=is&k=20&c=WYXyqMAYdtfWJ8qHcJ-KoARCSzdtVLYYotUq_lyOr0Q=' },
    { id: '8', name: 'Cup Cake', image: 'https://images.unsplash.com/photo-1550617931-e17a7b70dce2?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y3VwJTIwY2FrZXxlbnwwfHwwfHx8MA%3D%3D' },
    { id: '9', name: 'Marble Cake', image: 'https://media.istockphoto.com/id/1468569886/photo/marble-cake.webp?b=1&s=170667a&w=0&k=20&c=A1MDCQaaTYBok19XlkCHs6qHkA5nvGzWVmy3y016ho4=' },
    { id: '10', name: 'Cheese puff', image: 'https://images.unsplash.com/photo-1549203386-9d4394c8a2fe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Y2hlZXNlJTIwcHVmZnxlbnwwfHwwfHx8MA%3D%3D' },
    { id: '11', name: 'Choclate Croissant', image: 'https://media.istockphoto.com/id/1087617054/photo/chocolate-croissants-with-chocolate-sprinkles-isolated.webp?b=1&s=170667a&w=0&k=20&c=s2GkXcgs08bC74aBaK63EPNgxvWWGLwZTujBI0vSKcE=' },
    { id: '12', name: 'Apple puff', image: 'https://yaumi.com/upload/product/5be845e3b317259ec77276c17f3d617b.jpg' },
    { id: '13', name: 'Spicy Tortilla', image: 'https://yaumi.com/upload/product/bed083e2fb646e5a97fbf582e7349862.jpg' },
    { id: '14', name: 'Brown Tortilla', image: 'https://yaumi.com/upload/product/c67e7db843cc816a93c783d50c597056.jpg' },
    { id: '15', name: 'White Tortilla', image: 'https://yaumi.com/upload/product/424cffcb8ea9efe983619bde3cf63eed.jpg' },
]

export const placeholderImage = "https://i0.wp.com/repstack.co/wp-content/uploads/2022/08/placeholder.png";

export const getProductImage = (name: string) => {
    return productImageList.find(p => p.name == name)?.image || placeholderImage;
}