import { defineStore } from 'pinia'
import { getFirestore, doc, addDoc, collection, getDoc, query, where, getDocs } from 'firebase/firestore'
import { firebaseApp } from '../firebaseConfig'
import { ref, computed, reactive } from 'vue'

const db = getFirestore(firebaseApp)

/**
 * @description
 * Takes an Array<V>, and a grouping function,
 * and returns a Map of the array grouped by the grouping function.
 *
 * @param list An array of type V.
 * @param keyGetter A Function that takes the the Array type V as an input, and returns a value of type K.
 *                  K is generally intended to be a property key of V.
 *
 * @returns Map of the array grouped by the grouping function.
 */
//export function groupBy<K, V>(list: Array<V>, keyGetter: (input: V) => K): Map<K, Array<V>> {
//    const map = new Map<K, Array<V>>();
function groupBy(list, keyGetter) {
    const map = new Map();
    list.forEach((item) => {
         const key = keyGetter(item);
         const collection = map.get(key);
         if (!collection) {
             map.set(key, [item]);
         } else {
             collection.push(item);
         }
    });
    return map;
}

 


export const useItemsAmbienteStore = defineStore('items-ambiente', ()=>{
 const ambiente = ref(null)
 
 const inner_db = reactive({})
 const dados = computed( () => {
    if(ambiente.value){
        return inner_db[ambiente.value]
    }})

 async function load_data(){
    // só carrega o que não tá na inner_bd
    if (! inner_db.hasOwnProperty(ambiente.value) ){
        const q = query(collection(db, "items"), where('ambiente', '==', ambiente.value))
        const querySnapshot = await getDocs(q);
        inner_db[ambiente.value] = [];
        querySnapshot.forEach( function (doc) {  
            inner_db[ambiente.value].push(doc.data()) 
         })
        }
    }

    const dados_agrupados = computed( () =>  { 
        if(dados.value) {
            var mapa = groupBy(dados.value, x => x.short_descricao);
            var chaves = Array.from(mapa.keys())
            chaves.sort()
            var objeto_organizado = {}
            for(var k of chaves){
                objeto_organizado[k] = mapa.get(k)
            }
            return objeto_organizado
        }
    })

    return {ambiente, dados, load_data, dados_agrupados}
})

export const useDescricoesStore = defineStore("short-descricoes", {
    state: () => ({short_descricoes: null}),
    actions: {
        async load_data(){
            const docRef = doc(db, "agregados", "items");
            const docSnap = await getDoc(docRef);
            const $doc = docSnap.data()
            this.$patch({... $doc})
        }
    }

})



export const useItemsDescricaoStore = defineStore('items-descricao', ()=>{
    const short_descricao = ref(null)
    
    const inner_db = reactive({})
    const dados = computed( () => {
       if(short_descricao.value){
           return inner_db[short_descricao.value]
       }})
   
    async function load_data(){
       // só carrega o que não tá na inner_bd
       if (! inner_db.hasOwnProperty(short_descricao.value) ){
           const q = query(collection(db, "items"), where('short_descricao', '==', short_descricao.value))
           const querySnapshot = await getDocs(q);
           inner_db[short_descricao.value] = [];
           querySnapshot.forEach( function (doc) {  
               inner_db[short_descricao.value].push(doc.data()) 
            })
           }
       }
   
       const dados_agrupados = computed( () =>  { 
           if(dados.value) {
               var mapa = groupBy(dados.value, x => x.ambiente);
               var chaves = Array.from(mapa.keys())
               chaves.sort()
               var objeto_organizado = {}
               for(var k of chaves){
                   objeto_organizado[k] = mapa.get(k)
               }
               return objeto_organizado
           }
       })
   
       return {short_descricao, dados, load_data, dados_agrupados}
   })