import axios from 'axios'
const baseUrl = `${import.meta.env.VITE_API_URL}/api/specimen`

export const SpecimenService = {
    async getSpecimensData() {
        const specimens = await axios.get(`${baseUrl}`)
        return specimens
    },

    async updateSpecimens(records) {
        if (records.length == 1) {
            const {id, ...values} = records[0]
            const updatedRecords = await axios.put(`${baseUrl}/${id}`, values)
            return updatedRecords
        }
    },

    async addSpecimens(records) {
        if (records.length == 1) {
            const {id, ...values} = records[0]
            const newRecords = await axios.post(`${baseUrl}`, values)
            return newRecords
        }
    },

    async deleteSpecimens(records) {
        console.log(records)
        const deletedRecords = []
        for (const {id} of records) {
            console.log(id)
            const {data} = await axios.delete(`${baseUrl}/${id}`)
            deletedRecords.push(data)
        }
        return deletedRecords
    },
}
