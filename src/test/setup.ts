import '@testing-library/jest-dom'
// Registers IDBFactory, IDBRequest, IDBDatabase, etc. as globals
import 'fake-indexeddb/auto'
import { IDBFactory } from 'fake-indexeddb'
import { resetDB } from '../db/database'

// Fresh IndexedDB instance + closed DB singleton before every test
beforeEach(() => {
  globalThis.indexedDB = new IDBFactory()
  resetDB()
})
