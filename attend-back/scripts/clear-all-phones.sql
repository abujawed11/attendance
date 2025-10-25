-- Clear all phone numbers from User table to allow unique constraint
UPDATE User SET phone = NULL;

-- Verify
SELECT COUNT(*) as total_users,
       COUNT(phone) as users_with_phone
FROM User;
