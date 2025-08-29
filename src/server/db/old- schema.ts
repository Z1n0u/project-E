import {
  integer,
  pgTable,
  varchar,
  timestamp,
  primaryKey,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

import { uuid } from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  name: varchar({ length: 255 }).notNull(),
  lastname: varchar({ length: 255 }).notNull(),
  phone: varchar({ length: 255 }).notNull(),
  password: varchar({ length: 255 }).notNull(),
  role: varchar({ length: 255 }).notNull().default("user"),
});

export const wishlistTable = pgTable("wishlist", {
  id: uuid().primaryKey().defaultRandom(),
  // one wishlist has one user
  userId: uuid()
    .references(() => usersTable.id, { onDelete: "cascade" })
    .unique(),
});
export const productsTable = pgTable("products", {
  id: uuid().primaryKey().defaultRandom(),
  slug: varchar({ length: 255 }).notNull().unique(),
  title: varchar({ length: 255 }).notNull(),
  mainimage: varchar({ length: 255 }).notNull(),
  price: integer().notNull().default(0),
  rating: integer().notNull().default(0),
  description: varchar({ length: 255 }).notNull(),
  manufacturer: varchar({ length: 255 }).notNull(),
  instock: integer().notNull().default(1),
  categoryId: integer()
    .references(() => categoryTable.id, { onDelete: "cascade" })
    .notNull(),
});

// table to know every product that are in a wishlist, and what every wishlist has in it , and every wishlist belongs to one user
// table can also be called wishlist_items
export const wishlist_to_productTable = pgTable(
  "wishlist_to_product",
  {
    wishlistId: uuid()
      .references(() => wishlistTable.id)
      .notNull(),
    productId: uuid()
      .references(() => productsTable.id)
      .notNull(),
    addedAt: timestamp({ mode: "date" }).notNull().defaultNow(),
  },
  (t) => [
    primaryKey({ columns: [t.wishlistId, t.productId] }), // Composite PK
  ]
);

export const imageTable = pgTable("image", {
  id: uuid().primaryKey().defaultRandom(),
  productId: uuid()
    .references(() => productsTable.id)
    .notNull(),
  image: varchar({ length: 255 }).notNull(),
});

export const categoryTable = pgTable("category", {
  id: uuid().primaryKey().defaultRandom(),
  name: varchar({ length: 255 }).notNull(),
});

export const costumer_orderTable = pgTable("costumer_order", {
  id: uuid().primaryKey().defaultRandom(),
  userId: uuid()
    .references(() => usersTable.id)
    .notNull(),
  wilaya: varchar({ length: 255 }).notNull(),
  commune: varchar({ length: 255 }).notNull(),
  note: varchar({ length: 255 }),
  datetime: timestamp({ mode: "date" }).notNull().defaultNow(),
  total: integer().notNull().default(0),
});

export const costumer_order_to_productTable = pgTable(
  "costumer_order_to_product",
  {
    orderId: uuid()
      .references(() => costumer_orderTable.id)
      .notNull(),
    productId: uuid()
      .references(() => productsTable.id)
      .notNull(),
    quantity: integer().notNull().default(1),
  },
  (t) => [
    primaryKey({ columns: [t.orderId, t.productId] }), // Composite PK
  ]
);
//Relations
export const userRelations = relations(usersTable, ({ many }) => ({
  wishlists: many(wishlistTable), // One user has many wishlists
}));

export const wishlistRelations = relations(wishlistTable, ({ many, one }) => ({
  // One wishlist has many products
  products: many(productsTable),

  // One wishlist has one user
  user: one(usersTable, {
    fields: [wishlistTable.userId], //FK in wishlist table
    references: [usersTable.id], //PK in user table
  }),
}));

export const productRelations = relations(productsTable, ({ many, one }) => ({
  // One product has many images
  images: many(imageTable),
  // One product has one category
  category: one(categoryTable, {
    fields: [productsTable.categoryId],
    references: [categoryTable.id],
  }),
  // One product has many orders
  orders: many(costumer_orderTable),
  wishlists: many(wishlist_to_productTable),
}));

export const wishlist_to_productRelations = relations(
  wishlist_to_productTable,
  ({ one }) => ({
    product: one(productsTable, {
      fields: [wishlist_to_productTable.productId],
      references: [productsTable.id],
    }),
    wishlist: one(wishlistTable, {
      fields: [wishlist_to_productTable.wishlistId],
      references: [wishlistTable.id],
    }),
  })
);
export const imageRelations = relations(imageTable, ({ one }) => ({
  // One image has one product
  product: one(productsTable, {
    fields: [imageTable.productId],
    references: [productsTable.id],
  }),
}));

export const categoryRelations = relations(categoryTable, ({ many }) => ({
  // One category has many products
  products: many(productsTable),
}));

export const costumer_orderRelations = relations(
  costumer_orderTable,
  ({ many, one }) => ({
    // One costumer_order has many products
    products: many(productsTable),
    // One costumer_order has one user
    user: one(usersTable, {
      fields: [costumer_orderTable.userId],
      references: [usersTable.id],
    }),
  })
);

export const costumer_order_to_productRelations = relations(
  costumer_order_to_productTable,
  ({ one }) => ({
    // One costumer_order_to_product has one costumer_order
    costumer_order: one(costumer_orderTable, {
      fields: [costumer_order_to_productTable.orderId],
      references: [costumer_orderTable.id],
    }),
    // One costumer_order_to_product has one product
    product: one(productsTable, {
      fields: [costumer_order_to_productTable.productId],
      references: [productsTable.id],
    }),
  })
);
