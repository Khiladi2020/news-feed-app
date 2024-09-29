import * as SQLite from "expo-sqlite";
import { ArticleType } from "../types/news";

class DBService {
    #isDbInitialized = false;
    #isTableCreated = false;
    #db: SQLite.SQLiteDatabase | null = null;

    NAME = "DB Service";

    constructor() {}

    async dbInit() {
        if (this.#isDbInitialized === false) {
            try {
                this.#db = await SQLite.openDatabaseAsync("databaseName");
                this.#isDbInitialized = true;
                console.log(`${this.NAME} db connection opened`);
            } catch (err) {
                console.log("Error", err);
            }
        }
    }

    async createTable() {
        if (this.#isTableCreated == false) {
            try {
                await this.#db?.execAsync(`
                    CREATE TABLE IF NOT EXISTS news (
                        id INTEGER PRIMARY KEY NOT NULL,
                        author TEXT NOT NULL,
                        title TEXT,
                        source TEXT,
                        description TEXT,
                        url TEXT,
                        urlToImage TEXT,
                        publishedAt TEXT,
                        content TEXT
                    );
                `);
                console.log(`${this.NAME} table create success`);
                this.#isTableCreated = true;
            } catch (err) {
                console.log("Error", err);
            }
        }
    }

    async insertAllNews() {
        try {
            await this.dbInit();
            await this.createTable();

            await this.#db?.execAsync(`
                INSERT INTO news (author ,title ,source ,description ,url ,urlToImage ,publishedAt ,content)
                VALUES ("ravinder singh", "Hero", "Mint", "Hero h ji hero", "not present", "not present", "At world start", "super vala super hero h apna bhai");
            `);
            console.log(`${this.NAME} data insert success`);
        } catch (err) {
            console.error("Error in inserting data", err);
        }
    }

    async getAllNews() {
        try {
            await this.dbInit();
            await this.createTable();

            const data = await this.#db?.getAllAsync(`
                SELECT * from news;
            `);
            return data;
        } catch (err) {
            console.error("Error in getting data", err);
        }
    }
}

const dbServiceInstance = new DBService();
export { dbServiceInstance };
