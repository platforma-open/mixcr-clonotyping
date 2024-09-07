declare type TemplateFromFile = { readonly type: "from-file"; readonly path: string; };
declare type TplName = "calculate-pfconv-params" | "export-clones" | "get-preset-for-back" | "get-preset" | "list-presets" | "mixcr-analyze" | "prerun" | "process" | "test.columns.test" | "main";
declare const Templates: Record<TplName, TemplateFromFile>;
export { Templates };
