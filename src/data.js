module.exports = {
    getProducts(count) {
        const products = [];

        const limit = count;
        for (let id = 1; id <= limit; id++) {
            products.push({
                id,
                name: id + ". Креветки, партия " + Math.round(Math.random() * limit),
                description: "Крутые креветки ID: " + id + ". Доставка на номер " + Math.round(Math.random() * limit) + ".",
                image: "https://placehold.co/600x400"
            })
        }
        return products;
    }
}