import { DB } from '../index.js'
import log from '../discord/libs/logging.js'
import config from '../config.js'

export default (query, placeholder = []) => {
    return new Promise(async resolve => {
        DB.query(query, placeholder, (err, results) => {
            if(config.logging.mysql) {
                err && log({title: 'MYSQL', text: err, type: 'error'})
                log({title: 'MYSQL', text: results})
            }
            resolve({err, results})
        })
    })
}