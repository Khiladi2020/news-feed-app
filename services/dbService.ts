import * as SQLite from "expo-sqlite";
import { ArticleType } from "../types/news";

class DBService {
    #isDbInitialized = false;
    #isTableCreated = false;
    #db: SQLite.SQLiteDatabase | null = null;

    NAME = "[DB Service]";

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
                        content TEXT,
                        isPinned INTEGER
                    );
                `);
                console.log(`${this.NAME} table create success`);
                this.#isTableCreated = true;
            } catch (err) {
                console.log("Error", err);
            }
        }
    }

    async insertBulkNews(data: Array<ArticleType>) {
        try {
            await this.dbInit();
            await this.createTable();

            if (!data) {
                console.log(`${this.NAME} no valid data to insert`);
                return;
            }

            // form sql statement
            const values = data
                .map((val) => {
                    const stringifiedSource =
                        typeof val.source == "object"
                            ? val.source.name
                            : val.source;
                    const stringifiedAuthor = val.author?.replace(/"/g, "");
                    const stringifiedTitle = val.title?.replace(/"/g, "");
                    const stringifiedDescription = val.description?.replace(
                        /"/g,
                        ""
                    );
                    const stringifiedContent = val.content?.replace(/"/g, "");
                    return `("${stringifiedAuthor}", "${stringifiedTitle}", "${stringifiedSource}", "${stringifiedDescription}", "${
                        val.url
                    }", "${val.urlToImage}", "${
                        val.publishedAt
                    }", "${stringifiedContent}", ${val.isPinned ?? 0})`;
                })
                .join(",");

            console.log(
                "final query",
                `INSERT INTO news (author ,title ,source ,description ,url ,urlToImage ,publishedAt ,content, isPinned)
            VALUES ${values};`
            );

            await this.#db?.execAsync(`
                INSERT INTO news (author ,title ,source ,description ,url ,urlToImage ,publishedAt ,content, isPinned)
                VALUES ${values};
            `);
            console.log(`${this.NAME} data insert success`);
        } catch (err) {
            console.error(`${this.NAME} Error in inserting data`, err);
        }
    }

    async getAllNews(): Promise<ArticleType[]> {
        try {
            await this.dbInit();
            await this.createTable();

            const data = await this.#db?.getAllAsync(`
                SELECT * from news;
            `);
            return data as ArticleType[];
        } catch (err) {
            console.error(`${this.NAME} Error in getting data`, err);
            return [];
        }
    }

    async getBatchedNews(offset: number, limit: number) {
        try {
            await this.dbInit();
            await this.createTable();

            const data = await this.#db?.getAllAsync(`
                SELECT * from news
                ORDER BY publishedAt DESC
                LIMIT ${limit} OFFSET ${offset};
            `);
            return data as ArticleType[];
        } catch (err) {
            console.error(`${this.NAME} Error in getting data`, err);
            return [];
        }
    }

    async ifAnyNewsItemExists() {
        try {
            await this.dbInit();
            await this.createTable();

            const data = await this.#db?.getAllAsync(`
                SELECT count(*) from news;
            `);
            console.log(`${this.NAME} data received`, data);

            if (data?.length ?? 0 > 0) {
                const queryResult = (data![0] as any)["count(*)"];
                return queryResult > 0 ? true : false;
            }
        } catch (err) {
            console.error(`${this.NAME} Error in getting data`, err);
        }
    }

    async deleteAllData() {
        try {
            await this.dbInit();
            await this.createTable();

            await this.#db?.execAsync(`
                DELETE from news;
            `);

            console.log(`${this.NAME} news table deleted`);
        } catch (err) {
            console.error(`${this.NAME} Error in getting data`, err);
        }
    }

    async deleteTable() {
        try {
            await this.dbInit();
            await this.createTable();

            await this.#db?.execAsync(`
                DROP table news;
            `);

            console.log(`${this.NAME} news table deleted`);
        } catch (err) {
            console.error(`${this.NAME} Error in getting data`, err);
        }
    }

    async pinNewsItem(id: number, value: 0 | 1) {
        try {
            await this.dbInit();
            await this.createTable();

            const status = await this.#db?.execAsync(`
                UPDATE news
                SET isPinned=${value}
                WHERE id=${id};
            `);

            console.log(
                `${this.NAME} updated table isPinned for id: ${id}, status: ${status}`
            );
        } catch (err) {
            console.error(`${this.NAME} Error in setting pinned data`, err);
        }
    }
}

const dbServiceInstance = new DBService();
export { dbServiceInstance };
