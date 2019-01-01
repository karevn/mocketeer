import handle from "./handle";

const get = handle("get");
const post = handle("post");
const put = handle("put");
const deleteMethod = handle("delete");
const options = handle("options");

export default { get, post, put, deleteMethod, options };
