<script setup>
import { SpecimenService } from '@/service/SpecimenService';
import { Generate, rankWith } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/vue';
import { vanillaRenderers, DateTimeControlRenderer } from "@jsonforms/vue-vanilla";
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import _ from 'lodash';
import Button from 'primevue/button';
import DatePicker from 'primevue/datepicker';
import InputText from 'primevue/inputtext';
import SplitterPanel from 'primevue/splitterpanel';
import { computed, onBeforeMount, ref } from 'vue';
import { nullableDateTimeTester } from '@/helpers/jsonForms'


const renderers = [
  ...vanillaRenderers,
  // here you can add custom renderers
  //{ tester: rankWith(50, isStringControl), renderer: InputText },
  //{ tester: rankWith(100, nullableDateTimeTester), renderer: DatePicker },
  { tester: rankWith(100, nullableDateTimeTester), renderer: DateTimeControlRenderer },
]

const filters1 = ref(null)
const loading1 = ref(null)
const specimens1 = ref(null)
const schema1 = ref(null)
const uiSchema1 = ref(null)
const selectedRecords = ref(null)
const modifiedRecords = ref(null)
const metaKey = ref(true)
const showEditForm = computed(() => selectedRecords.value?.length == 1)
const showAddForm = ref(false)

onBeforeMount(() => {
    SpecimenService.getSpecimensData().then((result) => {
        specimens1.value = result?.data?.records
        schema1.value = result?.data?.schema
        uiSchema1.value = Generate.uiSchema(schema1.value)
    })
    
    initFilters1()
})

function initFilters1() {
    filters1.value = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        name: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.STARTS_WITH }] },
        created_at: { operator: FilterOperator.AND, constraints: [{ value: null, matchMode: FilterMatchMode.DATE_IS }] },
    }
}

function formatDateString(value) {
    const date = new Date(value)
    return date ? date.toISOString().split('T')[0] : ''
}

// function formatDate(value) {
//     return value.toLocaleDateString('en-US', {
//         day: '2-digit',
//         month: '2-digit',
//         year: 'numeric'
//     })
// }
function handleChange(value) {
    if (!_.isEqual(selectedRecords?.value?.[0], value?.data)) {
        modifiedRecords.value = [value.data]
    } else {
        modifiedRecords.value = null
    }
}
function didPressCancel() {
    selectedRecords.value = []
    modifiedRecords.value = null
    showAddForm.value = false
}
function didPressSubmit() {
    SpecimenService.updateSpecimensData(modifiedRecords.value).then((result) => {
        const specimenToUpdate = _.find(specimens1.value, { id: result?.data?.record?.id });
        if (specimenToUpdate) {
            _.assign(specimenToUpdate, result?.data?.record);
        }
    })
    
    selectedRecords.value = []
    modifiedRecords.value = null
}
function addRecord() {
    showAddForm.value = true
}
</script>

<template>
    <Splitter class="data-table-wrapper">
        <SplitterPanel class="flex" :size="66" >
            <DataTable
                v-if="specimens1"
                style="width:100%"
                :value="specimens1"
                selectionMode="multiple"
                :metaKeySelection="metaKey"
                v-model:selection="selectedRecords"
                :paginator="false"
                :rows="20"
                dataKey="id"
                :rowHover="true"
                v-model:filters="filters1"
                filterDisplay="menu"
                :loading="loading1"
                :filters="filters1"
                :globalFilterFields="['name']"
                showGridlines
            >
                <template #header>
                    <div class="flex justify-between">
                        <span class="text-xl font-bold">Specimens</span>
                        <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
                        <Button type="button" icon="pi pi-plus" label="New" outlined @click="addRecord()" />
                        <IconField>
                            <InputIcon>
                                <i class="pi pi-search" />
                            </InputIcon>
                            <InputText v-model="filters1['global'].value" placeholder="Keyword Search" />
                        </IconField>
                    </div>
                </template>
                <template #empty> No specimens found. </template>
                <template #loading> Loading specimens data. Please wait. </template>
                <Column field="name" header="Name" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ data.name }}
                    </template>
                    <template #filter="{ filterModel }">
                        <InputText v-model="filterModel.value" type="text" placeholder="Search by name" />
                    </template>
                </Column>
                <Column field="created_at" header="Created" dataType="date" style="min-width: 12rem">
                    <template #body="{ data }">
                        {{ formatDateString(data.created_at) }}
                    </template>
                    <template #filter="{ filterModel }">
                        <DatePicker v-model="filterModel.value" dateFormat="yy-mm-dd" placeholder="yyyy-mm-dd" />
                    </template>
                </Column>
            </DataTable>
        </SplitterPanel>
        <SplitterPanel class="flex items-center justify-center" v-if="showEditForm || showAddForm" :size="34" :minSize="10">
            <JsonForms
                :schema="schema1"
                :uiSchema="uiSchema1"
                :renderers="renderers"
                :data="selectedRecords?.[0] || null"
                @change="handleChange"
            />
            <div>
                <Button severity="danger" label="Cancel" @click="didPressCancel"></Button>
                <Button :disabled="!modifiedRecords" label="Submit" @click="didPressSubmit"></Button>
            </div>
        </SplitterPanel>
    </Splitter>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold
}

.data-table-wrapper {
    height: calc(100vh - 8rem)
}
</style>
