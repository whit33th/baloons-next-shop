import { Migrations } from "@convex-dev/migrations";
import { components, internal } from "./_generated/api.js";
import { DataModel } from "./_generated/dataModel.js";

export const migrations = new Migrations<DataModel>(components.migrations);

export const migrateCategoriesToArray = migrations.define({
  table: "products",
  migrateOne: async (ctx, product) => {
    if (typeof product.category === "string") {
      await ctx.db.patch(product._id, { categories: [product.category] });
    } else if (product.category === undefined) {
      await ctx.db.patch(product._id, { categories: [] });
    }
  },
});

export const runMigrateCategoriesToArray = migrations.runner(
  internal.migrations.migrateCategoriesToArray,
);
