import {
  pgTable,
  text,
  timestamp,
  boolean,
  varchar,
  integer,
  uuid,
  primaryKey,
} from "drizzle-orm/pg-core";

import { relations } from "drizzle-orm";

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  lastname: text("last_name").notNull(),
  phone: varchar("phone", { length: 10 }).notNull().unique(),
  role: text("role").notNull().default("user"),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified")
    .$defaultFn(() => false)
    .notNull(),
  image: text("image"),
  createdAt: timestamp("created_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
  updatedAt: timestamp("updated_at")
    .$defaultFn(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
  updatedAt: timestamp("updated_at").$defaultFn(
    () => /* @__PURE__ */ new Date()
  ),
});

export const wishlistTable = pgTable("wishlist", {
  id: uuid().primaryKey().defaultRandom(),
  // one wishlist has one user
  userId: text()
    .references(() => user.id, { onDelete: "cascade" })
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
  // in stock attribute for normal ecommerce but for the project with w4t3r
  // replace it with quantity till the product is ordered from the store
  instock: integer().notNull().default(1),
  categoryId: uuid()
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
  userId: text()
    .references(() => user.id)
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
export const userRelations = relations(user, ({ many }) => ({
  wishlists: many(wishlistTable), // One user has many wishlists
}));

export const wishlistRelations = relations(wishlistTable, ({ many, one }) => ({
  // One wishlist has many products
  products: many(productsTable),

  // One wishlist has one user
  user: one(user, {
    fields: [wishlistTable.userId], //FK in wishlist table
    references: [user.id], //PK in user table
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
    user: one(user, {
      fields: [costumer_orderTable.userId],
      references: [user.id],
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
