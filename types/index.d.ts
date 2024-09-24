import type { Sort } from 'mongodb';
declare module 'query-to-mongo' {
  interface QueryToMongoOptions {
    maxLimit?: string | number
    ignore?: 'fields' | 'omit' | 'sort' | 'offset' | 'limit'
    parser?: object
    keywords?: { [keyword: 'fields' | 'omit' | 'sort' | 'offset' | 'limit']: string }
  }

  interface QueryToMongoResult<T> {
    criteria: Omit<T, 'limit' | 'offset' | 'sort'>;
    options: {
      fields?: { [field: string]: true },
      limit?: number,
      skip?: number,
      sort?: Sort
    };
    link: Function
  }

  function queryToMongo<T>(query: T, options?: QueryToMongoOptions): QueryToMongoResult<T>;

  export = queryToMongo;
  
}
