<script setup>
import { SpecimenService } from '@/service/SpecimenService';
import { Generate, isStringControl, rankWith } from '@jsonforms/core';
import { JsonForms } from '@jsonforms/vue';
import {
    vanillaRenderers
} from "@jsonforms/vue-vanilla";
import { FilterMatchMode, FilterOperator } from '@primevue/core/api';
import InputNumber from 'primevue/inputnumber';
import InputText from 'primevue/inputtext';
import { onBeforeMount, ref } from 'vue';

// mergeStyles combines all classes from both styles definitions into one
//const myStyles = mergeStyles(defaultStyles, { control: { label: "mylabel" } });

const textRendererTester = (uischema, schema) => { 
    return rankWith(
        10, //increase rank as needed
        isStringControl
    )
};

const renderers = [
  ...vanillaRenderers,
  // here you can add custom renderers
  {
    tester: textRendererTester,
    rendererer: InputNumber
  },
];

const filters1 = ref(null)
const loading1 = ref(null)
const specimens1 = ref(null)
const schema1 = ref(null)
const uiSchema1 = ref(null)
const selectedRecords = ref(null)
const metaKey = ref(true)

onBeforeMount(() => {
    SpecimenService.getSpecimensData().then((data) => {
        specimens1.value = data?.data?.records
        schema1.value = data?.data?.schema
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

function formatDate(value) {
    return value.toLocaleDateString('en-US', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    });
}

</script>

<template>
    <div class="card">
        <div class="font-semibold text-xl mb-4">Specimens</div>
        <div>{{ filterModel }}</div>
        <JsonForms
            v-if="selectedRecords?.length==1"
            :schema="schema1"
            :uiSchema="uiSchema1"
            :renderers="renderers"
            :data="selectedRecords?.[0]"
            @change="handleChange"
        />
        <DataTable
            v-if="specimens1"
            :value="specimens1"
            selectionMode="multiple"
            :metaKeySelection="metaKey"
            v-model:selection="selectedRecords"
            :paginator="true"
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
                    <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined @click="clearFilter()" />
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
    </div>
</template>

<style scoped lang="scss">
:deep(.p-datatable-frozen-tbody) {
    font-weight: bold
}

:deep(.p-datatable-scrollable .p-frozen-column) {
    font-weight: bold
}
</style>
