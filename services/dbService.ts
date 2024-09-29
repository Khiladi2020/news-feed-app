import * as SQLite from "expo-sqlite";
import { ArticleType } from "../types/news";

class DBServices {
    #isDbInitialized = false;
    #db: SQLite.SQLiteDatabase | null = null;

    constructor() {
        (async () => {
            await this.dbInit();
            await this.createTable();
        })();
    }

    async dbInit() {
        if (this.#isDbInitialized === false) {
            this.#db = await SQLite.openDatabaseAsync("databaseName");
            this.#isDbInitialized = true;
        }
    }

    async createTable() {
        await this.#db?.execAsync(`
            CREATE TABLE IF NOT EXISTS news (
                id INTEGER PRIMARY KEY NOT NULL,
                author TEXT NOT NULL,
                title TEXT,
                description TEXT,
                url TEXT,
                urlToImage TEXT,
                publishedAt TEXT,
                content TEXT
            );
            `);
    }

    async insertAllNews(data: Array<ArticleType>) {}
}
