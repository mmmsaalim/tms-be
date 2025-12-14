-- DropForeignKey
ALTER TABLE `project_users` DROP FOREIGN KEY `project_users_user_id_fkey`;

-- AddForeignKey
ALTER TABLE `project_users` ADD CONSTRAINT `project_users_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
