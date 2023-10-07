import fs from "fs";
import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { customers, employees, orders, products, suppliers } from "./schema";
import { sql } from "drizzle-orm";

export const generateIds = (from: number, to: number) => {
  const ids = Array.from({ length: to - from + 1 }, (_, i) => i + from);
  return ids;
};

const rand = (idx: number) => 0 | (Math.random() * idx);
const randomItem = <T>(input: T[]) => {
  return input[Math.trunc(Math.random() * input.length)];
};

function shuffle(arr: any[]) {
  let last = arr.length;
  while (last > 0) {
    const n = rand(last);
    const m = --last;
    let tmp = arr[n];
    arr[n] = arr[m];
    arr[m] = tmp;
  }
}

const printIds = (ids: number[], count: number, path: string) => {
  const safeCount = Math.min(ids.length, count)
  const set = new Set<number>();
  do {
    const id = randomItem(ids);
    set.add(id);
  } while (set.size < safeCount);
  const idsToPrint = [...set];
  shuffle(idsToPrint);
  shuffle(idsToPrint);
  shuffle(idsToPrint);
  shuffle(idsToPrint);
  shuffle(idsToPrint);
  fs.writeFileSync(path, JSON.stringify(idsToPrint));
};



// const ip = "127.0.0.1";
const ip = "192.168.31.144";

const DATABASE_URL = `postgres://postgres:postgres@${ip}:5433/postgres`;

const client = postgres(DATABASE_URL);
const db = drizzle(client, { logger: false });


const main = async () => {
  const [
    { minId: employeesMinId, maxId: employeesMaxId, count: employeesCount },
  ] = await db
    .select({
      minId: sql<number>`min(${employees.id})::int`,
      maxId: sql<number>`max(${employees.id})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(employees);

  const [
    { minId: customersMinId, maxId: customersMaxId, count: customersCount },
  ] = await db
    .select({
      minId: sql<number>`min(${customers.id})::int`,
      maxId: sql<number>`max(${customers.id})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(customers);

  const [
    { minId: suppliersMinId, maxId: suppliersMaxId, count: suppliersCount },
  ] = await db
    .select({
      minId: sql<number>`min(${suppliers.id})::int`,
      maxId: sql<number>`max(${suppliers.id})::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(suppliers);

  const [{ minId: productsMinId, maxId: productsMaxId, count: productsCount }] =
    await db
      .select({
        minId: sql<number>`min(${products.id})::int`,
        maxId: sql<number>`max(${products.id})::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(products);

  const [{ minId: ordersMinId, maxId: ordersMaxId, count: ordersCount }] =
    await db
      .select({
        minId: sql<number>`min(${orders.id})::int`,
        maxId: sql<number>`max(${orders.id})::int`,
        count: sql<number>`count(*)::int`,
      })
      .from(orders);

  const employeeIds = generateIds(employeesMinId, employeesMaxId);
  const customerIds = generateIds(customersMinId, customersMaxId);
  const supplierIds = generateIds(suppliersMinId, suppliersMaxId);
  const productIds = generateIds(productsMinId, productsMaxId);
  const orderIds = generateIds(ordersMinId, ordersMaxId);

  printIds(customerIds, 500, "./customerByIds.json")
  printIds(employeeIds, 500, "./employeeByIds.json")
  printIds(supplierIds, 500, "./supplierByIds.json")
  printIds(productIds, 500, "./productByIds.json")
  printIds(orderIds, 500, "./orderByIds.json")

  process.exit(0);
};
main();
