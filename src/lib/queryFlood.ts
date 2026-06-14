import { prisma } from "./prisma";
let queryFloodRunning = false;
export function getQueryFloodStatus() { return { running: queryFloodRunning }; }
async function seedDataIfNeeded() {
  const catCount = await prisma.category.count();
  if (catCount > 0) return;
  const categories = await Promise.all(["Electronics","Clothing","Food","Sports","Books"].map(name => prisma.category.create({ data: { name } })));
  const products = await Promise.all(Array.from({ length: 100 }, (_, i) => prisma.product.create({ data: { name: `Product ${i}`, price: Math.random()*1000, stock: Math.floor(Math.random()*500), categoryId: categories[i % categories.length].id } })));
  const orders = await Promise.all(Array.from({ length: 50 }, () => prisma.order.create({ data: { total: Math.random()*5000, status: "pending" } })));
  await Promise.all(Array.from({ length: 200 }, (_, i) => prisma.orderItem.create({ data: { orderId: orders[i % orders.length].id, productId: products[i % products.length].id, quantity: Math.floor(Math.random()*10)+1, price: Math.random()*500 } })));
}
export async function startQueryFlood(concurrency = 20, durationMs = 60000) {
  queryFloodRunning = true;
  await seedDataIfNeeded();
  const endTime = Date.now() + durationMs;
  const heavyQuery = async () => {
    while (queryFloodRunning && Date.now() < endTime) {
      await prisma.$queryRaw`SELECT p.id, p.name, COUNT(oi.id) as orders, SUM(oi.quantity * oi.price) as revenue FROM "Product" p JOIN "Category" c ON p."categoryId" = c.id LEFT JOIN "OrderItem" oi ON oi."productId" = p.id GROUP BY p.id, p.name ORDER BY revenue DESC NULLS LAST`;
    }
  };
  await Promise.all(Array.from({ length: concurrency }, () => heavyQuery()));
  queryFloodRunning = false;
}
export function stopQueryFlood() { queryFloodRunning = false; }
