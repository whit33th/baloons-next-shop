// import { Migrations } from "@convex-dev/migrations";
// import { components, internal } from "./_generated/api.js";
// import type { DataModel } from "./_generated/dataModel.js";

// export const migrations = new Migrations<DataModel>(components.migrations);

// /**
//  * Миграция для преобразования поля isPersonalizable из boolean в объект
//  *
//  * Преобразует:
//  * - true -> {name: true, number: true}
//  * - false -> {name: false, number: false}
//  * - undefined/null -> {name: false, number: false}
//  *
//  * Для запуска миграции выполните:
//  * npx convex run migrations:run '{fn: "migrations:migrateIsPersonalizableToObject"}'
//  *
//  * После успешного завершения миграции обновите схему в schema.ts,
//  * убрав union и оставив только объект:
//  * isPersonalizable: v.optional(
//  *   v.object({
//  *     name: v.boolean(),
//  *     number: v.boolean(),
//  *   }),
//  * )
//  */
// export const migrateIsPersonalizableToObject = migrations.define({
//   table: "products",
//   migrateOne: async (ctx, product) => {
//     const currentValue = product.isPersonalizable;

//     // Если это старый boolean формат
//     if (typeof currentValue === "boolean") {
//       return {
//         isPersonalizable: {
//           name: currentValue,
//           number: currentValue,
//         },
//       };
//     }
//     // Если undefined или null, установить значения по умолчанию
//     else if (currentValue === undefined || currentValue === null) {
//       return {
//         isPersonalizable: {
//           name: false,
//           number: false,
//         },
//       };
//     }
//     // Если уже объект, ничего не делать (возвращаем undefined, чтобы пропустить)
//   },
// });
// // В вашем файле migrations.ts
// export const runMigrateIsPersonalizable = migrations.runner(
//   internal.migrations.migrateIsPersonalizableToObject,
// );
