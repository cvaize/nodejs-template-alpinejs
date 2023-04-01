const products = [];

const limit = 1000;
for (let id = 1; id <= limit; id++) {
    products.push({
        id,
        name: id + ". Креветки, партия " + Math.round(Math.random() * limit),
        description: "Крутые креветки ID: " + id + ". Доставка на номер " + Math.round(Math.random() * limit) + ".",
        image: "https://placehold.co/600x400"
    })
}

module.exports = {
    products
}