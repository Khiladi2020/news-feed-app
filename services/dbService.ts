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

    async insertBulkNews(data: Array<ArticleType>) {
        try {
            await this.dbInit();
            await this.createTable();

            // form sql statement
            const values = data
                .map((val) => {
                    const stringifiedSource = "";
                    const stringifiedAuthor = val.author?.replace(/"/g, "");
                    const stringifiedTitle = val.title?.replace(/"/g, "");
                    const stringifiedDescription = val.description?.replace(
                        /"/g,
                        ""
                    );
                    const stringifiedContent = val.content?.replace(/"/g, "");
                    return `("${stringifiedAuthor}", "${stringifiedTitle}", "${stringifiedSource}", "${stringifiedDescription}", "${val.url}", "${val.urlToImage}", "${val.publishedAt}", "${stringifiedContent}")`;
                })
                .join(",");

            console.log(
                "final query",
                `INSERT INTO news (author ,title ,source ,description ,url ,urlToImage ,publishedAt ,content)
            VALUES ${values};`
            );

            await this.#db?.execAsync(`
                INSERT INTO news (author ,title ,source ,description ,url ,urlToImage ,publishedAt ,content)
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
}

const dbServiceInstance = new DBService();
export { dbServiceInstance };
