import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export async function GET() {
  const results: any[] = [];
  const filePath = path.join(process.cwd(), "public", "new_orders.csv");

  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        try {
          results.push({
            id: results.length + 1,
            date: row["Order Date"],
            year: new Date(row["Order Date"]).getFullYear(),
            month: new Date(row["Order Date"]).getMonth() + 1,
            category: row["Category"],
            categoryId: 0, // map if needed
            city: row["City"],
            sales: parseFloat(row["Sales"]),
            profit: parseFloat(row["Profit"]),
            region: row["Region"],
          });
        } catch (err) {
          console.error("Row error:", err);
        }
      })
      .on("end", () => resolve(NextResponse.json(results)))
      .on("error", (err) => reject(NextResponse.json({ error: err.message }, { status: 500 })));
  });
}
