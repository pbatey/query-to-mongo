declare module 'query-to-mongo' {
  interface QueryToMongoOptions {
    maxLimit?: string | number
    ignore?: 'fields' | 'omit' | 'sort' | 'offset' | 'limit'
    parser?: object
  }

  interface QueryToMongoResult<T> {
    criteria: Omit<T, 'limit' | 'offset' | 'sort'>;
    options: {
      limit?: number,
      skip?: number,
      sort?: object
    };
    link: Function
  }

  function queryToMongo<T>(query: T, options?: QueryToMongoOptions): QueryToMongoResult<T>;

  export = queryToMongo;
  
}