import { Product, Stock } from "../../types/types";
import { DynamoDB } from "aws-sdk";
import { v4 } from "uuid";

const region = process.env.REGION || "ap-southeast-2";
const productsTableName = process.env.PRODUCTS || "Products";
const stockTableName = process.env.STOCK || "Stock";

const dynamoDB = new DynamoDB.DocumentClient({ region: region });

const products: Product[] = [
  {
    id: v4(),
    title: "Product 1",
    description: "This is product 1",
    price: 100,
  },
  {
    id: v4(),
    title: "Product 2",
    description: "This is product 2",
    price: 200,
  },
  {
    id: v4(),
    title: "Product 3",
    description: "This is product 3",
    price: 300,
  },
  {
    id: v4(),
    title: "Product 4",
    description: "This is product 4",
    price: 400,
  },
  {
    id: v4(),
    title: "Product 5",
    description: "This is product 5",
    price: 500,
  },
  {
    id: v4(),
    title: "Product 6",
    description: "This is product 6",
    price: 600,
  },
];

const stocks: Stock[] = products.map((product) => {
  return {
    product_id: product.id!,
    count: Math.ceil(Math.random() * 10),
  };
});

async function fillDB() {
  products.forEach((item) => {
    const params = {
      TableName: productsTableName,
      Item: item,
    };

    dynamoDB.put(params, function (err: Error) {
      if (err)
        console.error(
          "Unable to add product",
          item.title,
          ". Error JSON:",
          JSON.stringify(err, null, 2)
        );
      else console.log("PutItem succeeded:", item.title);
    });
  });

  stocks.forEach((item) => {
    const params = {
      TableName: stockTableName,
      Item: item,
    };

    dynamoDB.put(params, function (err: Error) {
      if (err)
        console.error(
          "Unable to add stock",
          item.product_id,
          ". Error JSON:",
          JSON.stringify(err, null, 2)
        );
      else console.log("PutItem succeeded:", item.product_id);
    });
  });
}

fillDB();
