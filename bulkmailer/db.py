import pymysql
import pymysql.cursors
from config import Config


def get_db():
    """Returns a new connection. Use in a `with` block or close manually."""
    return pymysql.connect(
        host=Config.MYSQL_HOST,
        user=Config.MYSQL_USER,
        password=Config.MYSQL_PASSWORD,
        database=Config.MYSQL_DB,
        cursorclass=pymysql.cursors.DictCursor,
        autocommit=False,
    )


def run_query(query, params=None, fetch=None):
    """
    fetch: None (no return, for INSERT/UPDATE/DELETE),
           'one' (single row),
           'all' (all rows)
    Returns lastrowid for INSERTs when fetch=None.
    """
    conn = get_db()
    try:
        with conn.cursor() as cur:
            cur.execute(query, params or ())
            if fetch == "one":
                result = cur.fetchone()
            elif fetch == "all":
                result = cur.fetchall()
            else:
                result = cur.lastrowid
        conn.commit()
        return result
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
