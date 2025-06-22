
-- Delete profiles with empty or null names
DELETE FROM public.profiles 
WHERE name IS NULL OR name = '' OR trim(name) = '';
