const fs = require("fs");

class ProductManager {
  constructor(filename) {
    this.products = [];
    this.path = filename;
    this.format = "utf-8";
  }

  generateId = () => {
    const lastProductId =
      this.products.length > 0 ? this.products[this.products.length - 1].id : 0;
    return lastProductId + 1;
  };

  validateProduct = ({ title, code, description, thumbnail, stock }) => {
    if ((!title, !code, !description, !thumbnail, !stock)) {
      console.error("Todos los campos deben tener un valor\n");
      return false;
    }

    const isCodeRepeated = this.products.some((p) => p.code === code);

    if (isCodeRepeated) {
      console.error(
        `Error: Ya existe un producto con el código ${code} ingresado.\n`
      );
      return false;
    }

    return true;
  };

  addProduct = async ({
    title,
    description,
    price,
    thumbnail,
    code,
    stock,
  }) => {
    const productToAdd = {
      id: this.generateId(),
      title,
      description,
      price,
      thumbnail,
      code,
      stock,
    };

    if (!this.validateProduct(productToAdd)) {
      console.log("Datos inválidos\n");
    }

    this.products.push(productToAdd);

    try {
      await fs.promises.writeFile(this.path, JSON.stringify(this.products));
    } catch (error) {
      console.error("Error escribiendo el archivo:\n");
    }

    console.log(
      `Producto ${JSON.stringify(productToAdd.id)} agregado:\n ${JSON.stringify(
        productToAdd
      )}\n`
    );
    return productToAdd;
  };

  getProducts = async () => {
    try {
      const data = await fs.promises.readFile(this.path, this.format);
      console.log("Productos:\n", JSON.parse(data));
      console.log();
      return JSON.parse(data);
    } catch (err) {
      if (err.code === "ENOENT") {
        await fs.promises.writeFile(this.path, "[]");
        console.log("Archivo 'data.json' creado\n");
        return [];
      } else {
        console.error("Error al leer el archivo:\n", err);
      }
    }
  };

  getProductById = (id) => {
    const product = this.products.find((product) => product.id === id);

    if (!product) throw new Error(`El producto ${id} no existe\n`);

    console.log(`Producto ${id} buscado:\n${JSON.stringify(product)}:\n`);
    return product;
  };

  updateProduct = async (id, updatedProduct) => {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex !== -1) {
        products[productIndex] = {
          ...products[productIndex],
          ...updatedProduct,
        };
        await fs.promises.writeFile(
          this.path,
          JSON.stringify(products, null, "\t")
        );
        console.log(
          `Producto ${id} editado:\n`,
          JSON.stringify(products[productIndex])
        );
        console.log();
      } else {
        throw new Error("No se encontró el producto\n");
      }
    } catch (error) {
      return error;
    }
  };

  deleteProduct = async (id) => {
    try {
      const products = await this.getProducts();
      const productIndex = products.findIndex((product) => product.id === id);

      if (productIndex === -1) {
        throw new Error(`El producto ${id} no se ha encontrado\n`);
      }

      products.splice(productIndex, 1);
      console.log(`Producto ${id} eliminado\n`);

      await fs.promises.writeFile(
        this.path,
        JSON.stringify(products, null, "\t")
      );
    } catch (error) {
      console.error(error.message);
    }
  };
}

// PARA REALIZAR EL TEST DESCOMENTAR EL CODIGO DE ABAJO

const manager = new ProductManager("data.json");

(async () => {
  try {
    await manager.getProducts();

    const productToAdd = {
      title: "producto prueba",
      description: "Este es un producto prueba",
      price: 200,
      thumbnail: "Sin imagen",
      code: "abc123",
      stock: 25,
    };

    const productToAdd2 = {
      title: "producto prueba 2",
      description: "Este es el segundo producto prueba",
      price: 400,
      thumbnail: "Sin imagen",
      code: "def123",
      stock: 15,
    };

    await manager.addProduct(productToAdd);
    await manager.getProducts();
    await manager.addProduct(productToAdd2);
    await manager.getProducts();

    await manager.updateProduct(1, {
      title: "producto prueba editado",
      description: "editado satisfactoriamente",
    });

    await manager.getProductById(2);

    await manager.deleteProduct(2);

    await manager.getProducts();
  } catch (error) {
    console.error(error.message);
  }
})();

console.log("\n¡TESTING FINALIZADO!");
