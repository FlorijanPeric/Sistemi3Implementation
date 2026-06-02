Generating and importing sample data
==================================

This folder contains `generate_seed.py` which produces `seed.sql` with sample rows
compatible with the database schema in `89231252-DatabaseFlowers (1).sql`.

Steps:

1. Ensure Python 3 is installed.
2. Install bcrypt: `pip install bcrypt`
3. Run the generator from the `backend/sql` directory:

```bash
python generate_seed.py
```

This will create `seed.sql`. Import it into your MySQL/MariaDB database (adjust user/password/database accordingly):

```bash
mysql -u root -p your_database_name < seed.sql
```

The script prints demo credentials (username / password) after generating the file.

If you prefer, you can open `generate_seed.py` and tweak sample usernames, passwords,
and product data before running.
