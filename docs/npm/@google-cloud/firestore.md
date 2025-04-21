# @google-cloud/firestore チートシート

`@google-cloud/firestore` は、Node.js から Google Cloud Firestore を操作するための公式ライブラリです。

**公式ドキュメント:**

*   [Cloud Firestore Documentation](https://cloud.google.com/firestore/docs)
*   [Node.js Client API Reference](https://cloud.google.com/nodejs/docs/reference/firestore/latest)
*   [GitHub Repository](https://github.com/googleapis/nodejs-firestore)

## インポート

```typescript
import {
  Firestore,
  Timestamp,
  FieldValue,
  GeoPoint,
  FieldPath,
  Filter,
  // ... 他の型
} from '@google-cloud/firestore';
```

## 初期化と認証

`Firestore` クライアントを初期化する際に、認証情報を渡す方法はいくつかあります。

**1. Application Default Credentials (ADC)**

Google Cloud 環境 (Cloud Run, Cloud Functions, GCE など) や、ローカルで `gcloud auth application-default login` を実行した場合、または `GOOGLE_APPLICATION_CREDENTIALS` 環境変数が設定されている場合に自動的に使用されます。

```typescript
// ADC を自動的に使用
const firestore = new Firestore();

// プロジェクトIDを明示的に指定する場合 (ADCで認証情報は取得)
const firestore = new Firestore({
  projectId: 'your-project-id',
});
```

**2. サービスアカウントキーファイル**

ダウンロードした JSON 形式のキーファイルを直接指定します。

```typescript
const firestore = new Firestore({
  projectId: 'your-project-id',
  keyFilename: '/path/to/your/keyfile.json',
});
```

**3. Credentials オブジェクト**

サービスアカウントの `client_email` と `private_key` を直接コード内で指定します。キーファイルの内容を環境変数などから読み込んで渡す場合に便利です。

**`client_email` と `private_key` の取得方法:**

1.  Google Cloud Console でプロジェクトを選択します。
2.  「IAM と管理」>「サービスアカウント」に移動します。
3.  使用するサービスアカウントを選択するか、新規に作成します。
4.  サービスアカウントの詳細画面で「キー」タブを選択し、「鍵を追加」>「新しい鍵を作成」をクリックします。
5.  キーのタイプとして **JSON** を選択し、「作成」をクリックすると、キーファイルがダウンロードされます。
6.  ダウンロードした JSON ファイルを開き、`client_email` と `private_key` の値を確認します。

**注意:** ダウンロードしたキーファイルや `private_key` は機密情報です。安全な場所に保管し、コードに直接ハードコーディングせず、環境変数や Secret Manager などを利用して管理することを強く推奨します。
```typescript
const firestore = new Firestore({
  projectId: 'your-project-id',
  credentials: {
    client_email: process.env.FIRESTORE_CLIENT_EMAIL,
    private_key: process.env.FIRESTORE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // 環境変数から改行を復元
  },
});
```

**4. データベースIDの指定**

デフォルト以外のデータベースを使用する場合は `databaseId` を指定します。認証情報は他の方法と組み合わせます。

```typescript
// ADC + 特定のデータベースID
const firestore = new Firestore({
  databaseId: 'your-database-id',
});

// キーファイル + 特定のデータベースID
const firestore = new Firestore({
  projectId: 'your-project-id',
  keyFilename: '/path/to/your/keyfile.json',
  databaseId: 'your-database-id',
});
```

**認証に関するドキュメント:**

*   [サーバー環境での認証の設定](https://cloud.google.com/docs/authentication/provide-credentials-adc?hl=ja#server-side)
*   [クライアント ライブラリの認証を行う](https://cloud.google.com/docs/authentication/provide-credentials-adc?hl=ja)

**APIキーについて**

`@google-cloud/firestore` のようなサーバーサイドのクライアントライブラリでは、**APIキーは認証には使用されません**。APIキーは主に認証不要なパブリックAPIへのアクセスや使用量追跡に使われ、Firestoreのようなデータアクセス権限が必要なサービスには、より安全なADCやサービスアカウントキーが推奨されます。

## 主要なクラスと概念

### `Firestore`

*   Firestoreデータベースへのエントリーポイント。
*   `collection(path)`: `CollectionReference` を取得します。
*   `doc(path)`: `DocumentReference` を取得します。
*   `collectionGroup(id)`: `CollectionGroup` (Query) を取得します。
*   `batch()`: `WriteBatch` を作成します。
*   `runTransaction(updateFunction, options?)`: トランザクションを実行します。
*   `getAll(...documentRefsOrReadOptions)`: 複数のドキュメントを一度に取得します。
*   `listCollections()`: ルートコレクションの一覧を取得します。
*   `settings(settings)`: Firestoreクライアントの設定を行います（初期化前のみ）。
*   `terminate()`: クライアントを終了します。

### `DocumentReference<AppModelType, DbModelType>`

*   特定のドキュメントへの参照。
*   `id`: ドキュメントID。
*   `path`: ドキュメントへのパス。
*   `parent`: 親の `CollectionReference`。
*   `get()`: ドキュメントを取得します (`DocumentSnapshot` を返す)。
*   `create(data)`: ドキュメントを作成します（存在する場合は失敗）。
*   `set(data, options?)`: ドキュメントを作成または上書き/マージします。
*   `update(dataOrField, ...preconditionOrValues)`: ドキュメントを更新します（存在しない場合は失敗）。
*   `delete(precondition?)`: ドキュメントを削除します。
*   `collection(path)`: サブコレクションへの `CollectionReference` を取得します。
*   `listCollections()`: サブコレクションの一覧を取得します。
*   `onSnapshot(onNext, onError?)`: ドキュメントの変更をリッスンします。
*   `withConverter(converter)`: データコンバータを適用します。

### `CollectionReference<AppModelType, DbModelType>`

*   特定のコレクションへの参照。`Query` を継承します。
*   `id`: コレクションID。
*   `path`: コレクションへのパス。
*   `parent`: 親の `DocumentReference` (サブコレクションの場合) または `null`。
*   `doc(path?)`: コレクション内の `DocumentReference` を取得します（path省略時は自動ID）。
*   `add(data)`: 新しいドキュメントを追加します（自動ID）。
*   `listDocuments()`: コレクション内のドキュメント参照一覧を取得します。
*   `withConverter(converter)`: データコンバータを適用します。

### `Query<AppModelType, DbModelType>`

*   Firestoreクエリを表します。
*   `where(fieldPathOrFilter, opStr?, value?)`: フィルタ条件を追加します。
*   `orderBy(fieldPath, directionStr?)`: ソート順を追加します。
*   `limit(limit)`: 取得するドキュメント数を制限します。
*   `limitToLast(limit)`: 末尾から取得するドキュメント数を制限します（`orderBy`が必須）。
*   `offset(offset)`: 結果の開始位置を指定します。
*   `select(...fieldPaths)`: 取得するフィールドを指定します。
*   `startAt(snapshotOrFieldValue, ...fieldValues)`: クエリの開始位置を指定します（指定位置を含む）。
*   `startAfter(snapshotOrFieldValue, ...fieldValues)`: クエリの開始位置を指定します（指定位置を含まない）。
*   `endBefore(snapshotOrFieldValue, ...fieldValues)`: クエリの終了位置を指定します（指定位置を含まない）。
*   `endAt(snapshotOrFieldValue, ...fieldValues)`: クエリの終了位置を指定します（指定位置を含む）。
*   `get()`: クエリを実行し、`QuerySnapshot` を取得します。
*   `stream()`: クエリ結果をストリームとして取得します。
*   `onSnapshot(onNext, onError?)`: クエリ結果の変更をリッスンします。
*   `count()`: クエリ結果のドキュメント数をカウントする `AggregateQuery` を作成します。
*   `aggregate(spec)`: 指定された集計を行う `AggregateQuery` を作成します。
*   `findNearest(options)`: ベクトル検索を行う `VectorQuery` を作成します。
*   `withConverter(converter)`: データコンバータを適用します。

### `DocumentSnapshot<AppModelType, DbModelType>`

*   ドキュメントの読み取り結果。
*   `exists`: ドキュメントが存在するかどうか。
*   `id`: ドキュメントID。
*   `ref`: ドキュメントへの `DocumentReference`。
*   `data()`: ドキュメントのデータをオブジェクトとして取得します（存在しない場合は `undefined`）。
*   `get(fieldPath)`: 特定のフィールドの値を取得します。
*   `createTime`: 作成時刻 (`Timestamp`)。
*   `updateTime`: 最終更新時刻 (`Timestamp`)。
*   `readTime`: 読み取り時刻 (`Timestamp`)。

### `QueryDocumentSnapshot<AppModelType, DbModelType>`

*   クエリ結果に含まれるドキュメントのスナップショット。`DocumentSnapshot` を継承。
*   `exists` は常に `true`。
*   `data()` は常に `AppModelType` 型のオブジェクトを返します。

### `QuerySnapshot<AppModelType, DbModelType>`

*   クエリの実行結果。
*   `docs`: 結果の `QueryDocumentSnapshot` の配列。
*   `empty`: 結果が空かどうか。
*   `size`: 結果のドキュメント数。
*   `query`: 元の `Query`。
*   `readTime`: 読み取り時刻 (`Timestamp`)。
*   `docChanges()`: 前回のスナップショットからの変更点の配列 (`DocumentChange[]`)。
*   `forEach(callback, thisArg?)`: 結果の各ドキュメントに対してコールバックを実行します。

### `DocumentChange<AppModelType, DbModelType>`

*   `QuerySnapshot` 内の個々のドキュメントの変更を表します。
*   `type`: 変更の種類 (`'added'`, `'modified'`, `'removed'`)。
*   `doc`: 変更された `QueryDocumentSnapshot`。
*   `oldIndex`: 変更前の結果セット内でのインデックス。
*   `newIndex`: 変更後の結果セット内でのインデックス。

### `WriteBatch`

*   複数の書き込み操作をアトミックに実行します。
*   `create(docRef, data)`
*   `set(docRef, data, options?)`
*   `update(docRef, dataOrField, ...preconditionOrValues)`
*   `delete(docRef, precondition?)`
*   `commit()`: バッチ内のすべての操作を実行します。

### `Transaction`

*   アトミックな読み取りと書き込み操作のセットを実行します。
*   `get(docRefOrQuery)`: ドキュメントまたはクエリ結果を取得します（ロックを取得）。
*   `getAll(...docRefs)`: 複数のドキュメントを取得します（ロックを取得）。
*   `create(docRef, data)`
*   `set(docRef, data, options?)`
*   `update(docRef, dataOrField, ...preconditionOrValues)`
*   `delete(docRef, precondition?)`
*   トランザクション関数内で使用され、`firestore.runTransaction()` によって自動的にコミット/ロールバックされます。

### `FieldValue`

*   書き込み操作で使用される特別な値。
*   `FieldValue.serverTimestamp()`: サーバータイムスタンプ。
*   `FieldValue.delete()`: フィールドの削除。
*   `FieldValue.increment(n)`: 数値フィールドの増分。
*   `FieldValue.arrayUnion(...elements)`: 配列フィールドへの要素の追加（重複なし）。
*   `FieldValue.arrayRemove(...elements)`: 配列フィールドからの要素の削除。
*   `FieldValue.vector(values)`: ベクトル値。

### `Timestamp`

*   特定の時点を表す Firestore のタイムスタンプ型。
*   `static now()`: 現在時刻のタイムスタンプを作成します。
*   `static fromDate(date)`: JavaScript の `Date` オブジェクトからタイムスタンプを作成します。
*   `static fromMillis(milliseconds)`: ミリ秒からタイムスタンプを作成します。
*   `toDate()`: JavaScript の `Date` オブジェクトに変換します。
*   `toMillis()`: ミリ秒単位のエポックタイムに変換します。

### `GeoPoint`

*   地理的な位置を表す Firestore の型。
*   `latitude`: 緯度 (-90 から 90)。
*   `longitude`: 経度 (-180 から 180)。

### `FieldPath`

*   ドキュメント内のフィールドへのパス。ドット区切り文字列 (`'a.b'`) またはフィールド名の配列で指定します。
*   `static documentId()`: ドキュメントIDを参照する特別な `FieldPath` を返します。

### `Filter`

*   クエリのフィルタ条件を表します。`where()`, `or()`, `and()` で作成します。
*   `static where(fieldPath, opStr, value)`: 単一フィールドのフィルタを作成します。
*   `static or(...filters)`: OR 条件の複合フィルタを作成します。
*   `static and(...filters)`: AND 条件の複合フィルタを作成します。

### `AggregateQuery<AggregateSpecType>`

*   集計クエリを表します。`query.aggregate()` で作成します。
*   `get()`: 集計クエリを実行し、`AggregateQuerySnapshot` を取得します。

### `AggregateQuerySnapshot<AggregateSpecType>`

*   集計クエリの実行結果。
*   `data()`: 集計結果を `{ alias: value }` 形式のオブジェクトで取得します。

### `AggregateField<T>`

*   集計の種類と対象フィールドを表します。
*   `static count()`: ドキュメント数をカウントします。
*   `static sum(fieldPath)`: 指定フィールドの合計値を計算します。
*   `static average(fieldPath)`: 指定フィールドの平均値を計算します。

### `VectorQuery<AppModelType, DbModelType>`

*   ベクトル検索クエリを表します。`query.findNearest()` で作成します。
*   `get()`: ベクトル検索を実行し、`VectorQuerySnapshot` を取得します。

### `VectorQuerySnapshot<AppModelType, DbModelType>`

*   ベクトル検索クエリの実行結果。`QuerySnapshot` と似たインターフェースを持ちます。

### `VectorValue`

*   ベクトル値を表します。`FieldValue.vector()` で作成します。
*   `toArray()`: ベクトルの数値配列を取得します。

## 基本的な操作例

### ドキュメントの作成 (自動ID)

```typescript
const colRef = firestore.collection('cities');
const data = { name: 'Tokyo', country: 'Japan' };

try {
  const docRef = await colRef.add(data);
  console.log('Document written with ID: ', docRef.id);
} catch (e) {
  console.error('Error adding document: ', e);
}
```

### ドキュメントの作成または上書き (指定ID)

```typescript
const docRef = firestore.doc('cities/SF');
const data = {
    name: 'San Francisco', state: 'CA', country: 'USA',
    capital: false, population: 860000,
    regions: ['west_coast', 'norcal']
};

try {
  // ドキュメントが存在しない場合は作成、存在する場合は上書き
  const res = await docRef.set(data);
  console.log('Document successfully written!', res.writeTime.toDate());
} catch (e) {
  console.error('Error writing document: ', e);
}
```

### ドキュメントのマージ (指定ID)

```typescript
const docRef = firestore.doc('cities/SF');
const data = { capital: true };

try {
  // 既存ドキュメントに 'capital: true' フィールドを追加または更新
  const res = await docRef.set(data, { merge: true });
  console.log('Document successfully merged!', res.writeTime.toDate());
} catch (e) {
  console.error('Error merging document: ', e);
}
```

### ドキュメントの取得

```typescript
const docRef = firestore.doc('cities/SF');

try {
  const docSnap = await docRef.get();
  if (docSnap.exists) {
    console.log('Document data:', docSnap.data());
  } else {
    console.log('No such document!');
  }
} catch (e) {
  console.error('Error getting document:', e);
}
```

### 複数ドキュメントの取得

```typescript
const docRef1 = firestore.doc('cities/SF');
const docRef2 = firestore.doc('cities/TOK');

try {
  const snapshots = await firestore.getAll(docRef1, docRef2);
  snapshots.forEach(snap => {
    if (snap.exists) {
      console.log(`Document ${snap.id} data:`, snap.data());
    } else {
      console.log(`Document ${snap.id} not found.`);
    }
  });
} catch (e) {
  console.error('Error getting documents:', e);
}
```

### ドキュメントの更新

```typescript
const docRef = firestore.doc('cities/SF');

try {
  const res = await docRef.update({
    population: 880000,
    'regions.1': 'northern_california' // 配列要素の更新
  });
  console.log('Document successfully updated!', res.writeTime.toDate());
} catch (e) {
  console.error('Error updating document:', e);
}
```

### フィールドの削除

```typescript
const docRef = firestore.doc('cities/SF');

try {
  const res = await docRef.update({
    capital: FieldValue.delete()
  });
  console.log('Field successfully deleted!', res.writeTime.toDate());
} catch (e) {
  console.error('Error deleting field:', e);
}
```

### ドキュメントの削除

```typescript
const docRef = firestore.doc('cities/SF');

try {
  const res = await docRef.delete();
  console.log('Document successfully deleted!', res.writeTime.toDate());
} catch (e) {
  console.error('Error deleting document:', e);
}
```

### 単純なクエリ

```typescript
const citiesRef = firestore.collection('cities');
const q = citiesRef.where('capital', '==', true);

try {
  const querySnapshot = await q.get();
  querySnapshot.forEach(doc => {
    console.log(doc.id, ' => ', doc.data());
  });
} catch (e) {
  console.error('Error getting documents: ', e);
}
```

### 複合クエリ (AND)

```typescript
const citiesRef = firestore.collection('cities');
const q = citiesRef.where('state', '==', 'CA').where('population', '>', 1000000);
// または Filter.and() を使用
// const q = citiesRef.where(Filter.and(
//   Filter.where('state', '==', 'CA'),
//   Filter.where('population', '>', 1000000)
// ));

try {
  const querySnapshot = await q.get();
  // ...
} catch (e) {
  console.error('Error getting documents: ', e);
}
```

### 複合クエリ (OR)

```typescript
const citiesRef = firestore.collection('cities');
const q = citiesRef.where(Filter.or(
  Filter.where('capital', '==', true),
  Filter.where('population', '>=', 1000000)
));

try {
  const querySnapshot = await q.get();
  // ...
} catch (e) {
  console.error('Error getting documents: ', e);
}
```

### バッチ書き込み

```typescript
const batch = firestore.batch();

const sfRef = firestore.doc('cities/SF');
batch.update(sfRef, { population: 900000 });

const laRef = firestore.doc('cities/LA');
batch.set(laRef, { name: 'Los Angeles', state: 'CA', country: 'USA' });

const nycRef = firestore.doc('cities/NYC');
batch.delete(nycRef);

try {
  const writeResults = await batch.commit();
  console.log('Batch successfully committed.');
  writeResults.forEach((result, index) => {
    console.log(`Write ${index} result: ${result.writeTime.toDate()}`);
  });
} catch (e) {
  console.error('Batch failed: ', e);
}
```

### トランザクション

```typescript
const sfRef = firestore.doc('cities/SF');

try {
  const newPopulation = await firestore.runTransaction(async (transaction) => {
    const sfDoc = await transaction.get(sfRef);
    if (!sfDoc.exists) {
      throw 'Document does not exist!';
    }
    const currentPopulation = sfDoc.data()?.population || 0;
    const newPop = currentPopulation + 1;
    transaction.update(sfRef, { population: newPop });
    return newPop; // トランザクションの結果として返す値
  });
  console.log('Population updated to ', newPopulation);
} catch (e) {
  console.error('Transaction failed: ', e);
}
```

### 集計クエリ (カウント)

```typescript
const citiesRef = firestore.collection('cities');
const query = citiesRef.where('state', '==', 'CA');
const countQuery = query.count();

try {
  const snapshot = await countQuery.get();
  console.log(`Count of cities in CA: ${snapshot.data().count}`);
} catch (e) {
  console.error('Count query failed: ', e);
}
```

### 集計クエリ (合計・平均)

```typescript
const citiesRef = firestore.collection('cities');
const aggregateQuery = citiesRef.aggregate({
  totalPopulation: AggregateField.sum('population'),
  averagePopulation: AggregateField.average('population')
});

try {
  const snapshot = await aggregateQuery.get();
  console.log('Total population:', snapshot.data().totalPopulation);
  console.log('Average population:', snapshot.data().averagePopulation);
} catch (e) {
  console.error('Aggregate query failed: ', e);
}
```

### ベクトル検索

```typescript
const itemsRef = firestore.collection('items');
const queryVector = FieldValue.vector([0.1, 0.2, 0.3]); // 検索ベクトル

const vectorQuery = itemsRef.findNearest({
  vectorField: 'embedding', // ベクトルフィールド名
  queryVector: queryVector,
  limit: 5, // 上位5件を取得
  distanceMeasure: 'COSINE' // 距離尺度（COSINE, EUCLIDEAN, DOT_PRODUCT）
});

try {
  const snapshot = await vectorQuery.get();
  snapshot.forEach(doc => {
    console.log(doc.id, '=>', doc.data());
    // オプションで距離を取得する場合
    // console.log('Distance:', doc.get('distance'));
  });
} catch (e) {
  console.error('Vector query failed:', e);
}
