// 01020103636174010463617431
export function deserializeBytearray(data) {
  let mutatedData = data;
  const collection_length_length = Number(mutatedData.slice(0, 2));
  mutatedData = mutatedData.slice(2);

  // # get length of collection
  const collection_len = Number(mutatedData.slice(0, collection_length_length + 1));
  mutatedData = mutatedData.slice(collection_length_length + 1);

  // # create a new collection
  const new_collection = [];

  for (let i = 0; i < collection_len; i++) {

    // # get the data length length
    const itemlen_len = Number(mutatedData.slice(0, 2));
    mutatedData = mutatedData.slice(2);

    // # get the length of the data
    const item_len = Number(mutatedData.slice(0, itemlen_len + 1)) * 2;
    mutatedData = mutatedData.slice(itemlen_len + 1);

    // # get the data
    const item = Number(mutatedData.slice(0, item_len));
    console.log(itemlen_len, item_len, item, mutatedData);
    mutatedData = mutatedData.slice(item_len);
    console.log(itemlen_len, item_len, item, mutatedData);

    // # store it in collection
    new_collection.push(item);

  }

  return new_collection;
}
