/*
  Warnings:

  - Made the column `description` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `imageUrl` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `data` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `menu_items` required. This step will fail if there are existing NULL values in that column.
  - Made the column `schema` on table `menu_sections` required. This step will fail if there are existing NULL values in that column.
  - Made the column `order` on table `menu_sections` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "menu_items" ALTER COLUMN "description" SET NOT NULL,
ALTER COLUMN "imageUrl" SET NOT NULL,
ALTER COLUMN "data" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL;

-- AlterTable
ALTER TABLE "menu_sections" ALTER COLUMN "schema" SET NOT NULL,
ALTER COLUMN "order" SET NOT NULL;
