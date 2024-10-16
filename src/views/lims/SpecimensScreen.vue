<script setup>
import { SpecimenService } from '@/service/SpecimenService';
import { FilterMatchMode } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';
import { onMounted, ref } from 'vue';
import _ from 'lodash'

onMounted(() => {
    SpecimenService.getSpecimensData().then((result) => {
        specimens.value = result?.data?.records
    })
});

const toast = useToast();
const dt = ref();
const specimens = ref();
const showEditForm = ref(false);
const deleteSpecimenDialog = ref(false);
const deleteSpecimensDialog = ref(false);
const specimen = ref({});
const selectedSpecimens = ref();
const filters = ref({
    global: { value: null, matchMode: FilterMatchMode.CONTAINS }
});
const submitted = ref(false);
const statuses = ref([
    { label: 'INSTOCK', value: 'instock' },
    { label: 'LOWSTOCK', value: 'lowstock' },
    { label: 'OUTOFSTOCK', value: 'outofstock' }
]);

function formatDate(value) {
    const date = value ? new Date(value) : null
    return date ? date.toISOString().split('T')[0] : ''
}

function openNew() {
    specimen.value = {};
    submitted.value = false;
    showEditForm.value = true;
}

function hideDialog() {
    showEditForm.value = false;
    submitted.value = false;
}

function saveSpecimen() {
    submitted.value = true;

    if (specimen.value.id) {
        // updating single record
        SpecimenService.updateSpecimens([specimen.value]).then((result) => {
            const specimenToUpdate = _.find(specimens.value, { id: result?.data?.record?.id });
            if (specimenToUpdate) {
                _.assign(specimenToUpdate, result?.data?.record);
            }
            specimen.value = {};
            hideDialog()
        })
    } else {
        // new record
        SpecimenService.addSpecimens([specimen.value]).then((result) => {
            specimens.value = _.concat(specimens.value, result?.data?.record)
            specimen.value = {};
            hideDialog()
        })
    }
}

function editSpecimen(prod) {
    specimen.value = { ...prod };
    showEditForm.value = true;
}

function confirmDeleteSpecimen(prod) {
    specimen.value = prod;
    deleteSpecimenDialog.value = true;
}

function deleteSpecimen() {
    specimens.value = specimens.value.filter((val) => val.id !== specimen.value.id);
    deleteSpecimenDialog.value = false;
    specimen.value = {};
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Specimen Deleted', life: 3000 });
}

function findIndexById(id) {
    let index = -1;
    for (let i = 0; i < specimens.value.length; i++) {
        if (specimens.value[i].id === id) {
            index = i;
            break;
        }
    }

    return index;
}

function exportCSV() {
    dt.value.exportCSV();
}

function confirmDeleteSelected() {
    deleteSpecimensDialog.value = true;
}

function deleteSelectedSpecimens() {
    specimens.value = specimens.value.filter((val) => !selectedSpecimens.value.includes(val));
    deleteSpecimensDialog.value = false;
    selectedSpecimens.value = null;
    toast.add({ severity: 'success', summary: 'Successful', detail: 'Specimens Deleted', life: 3000 });
}

</script>

<template>
    <Splitter class="h-[calc(100vh-8rem)]">
        <SplitterPanel class="flex" :size="66" >
            <div class="w-full">
                <Toolbar>
                    <template #start>
                        <Button label="New" icon="pi pi-plus" severity="secondary" class="mr-2" @click="openNew" />
                        <Button label="Delete" icon="pi pi-trash" severity="secondary" @click="confirmDeleteSelected" :disabled="!selectedSpecimens || !selectedSpecimens.length" />
                    </template>
                    <template #end>
                        <Button label="Export" icon="pi pi-upload" severity="secondary" @click="exportCSV($event)" />
                    </template>
                </Toolbar>
                <DataTable
                    ref="dt"
                    v-model:selection="selectedSpecimens"
                    :value="specimens"
                    dataKey="id"
                    scrollable 
                    scrollHeight="flex"
                    :filters="filters"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} specimens"
                >
                    <template #header>
                        <div class="flex flex-wrap gap-2 items-center justify-between">
                            <h4 class="m-0">Specimens</h4>
                            <IconField>
                                <InputIcon>
                                    <i class="pi pi-search" />
                                </InputIcon>
                                <InputText v-model="filters['global'].value" placeholder="Search..." />
                            </IconField>
                        </div>
                    </template>

                    <Column selectionMode="multiple" style="width: 3rem" :exportable="false"></Column>
                    <Column field="name" header="Name" sortable style="min-width: 16rem"></Column>
                    <Column field="created_at" header="Created" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.created_at) }}
                        </template>
                    </Column>
                    <Column field="updated_at" header="Updated" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.updated_at) }}
                        </template>
                    </Column>
                    <Column field="deleted_at" header="Deleted" sortable style="min-width: 8rem">
                        <template #body="slotProps">
                            {{ formatDate(slotProps.data.deleted_at) }}
                        </template>
                    </Column>
                    <Column :exportable="false" style="min-width: 12rem">
                        <template #body="slotProps">
                            <Button icon="pi pi-pencil" text rounded class="mr-2" @click="editSpecimen(slotProps.data)" />
                            <Button icon="pi pi-trash" text rounded severity="danger" @click="confirmDeleteSpecimen(slotProps.data)" />
                        </template>
                    </Column>
                </DataTable>
            </div>
        </SplitterPanel>

        <SplitterPanel v-if="showEditForm" class="flex" header="Specimen Details">
            <div class="flex flex-col gap-6 p-10">
                <div>
                    <label for="name" class="block font-bold mb-3">Name</label>
                    <InputText id="name" v-model.trim="specimen.name" required="true" autofocus :invalid="submitted && !specimen.name" fluid />
                    <small v-if="submitted && !specimen.name" class="text-red-500">Name is required.</small>
                </div>
                <div>
                    <label for="created_at" class="block font-bold mb-3">Created</label>
                    <DatePicker 
                        id="created_at"
                        v-model.trim="specimen.created_at" 
                        showTime 
                        showIcon
                        dateFormat="yy-mm-dd"
                        hourFormat="24"
                        autofocus 
                        :invalid="submitted && !specimen.created_at" 
                        fluid 
                    />
                    <small v-if="submitted && !specimen.created_at" class="text-red-500">Created timestamp is required.</small>
                </div>
                <div>
                    <Button label="Cancel" icon="pi pi-times" text @click="hideDialog" />
                    <Button label="Save" icon="pi pi-check" @click="saveSpecimen" />
                </div>
            </div>
            
        </SplitterPanel>
    </Splitter>
        <Dialog v-model:visible="deleteSpecimenDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="specimen"
                    >Are you sure you want to delete <b>{{ specimen.name }}</b
                    >?</span
                >
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSpecimenDialog = false" />
                <Button label="Yes" icon="pi pi-check" @click="deleteSpecimen" />
            </template>
        </Dialog>

        <Dialog v-model:visible="deleteSpecimensDialog" :style="{ width: '450px' }" header="Confirm" :modal="true">
            <div class="flex items-center gap-4">
                <i class="pi pi-exclamation-triangle !text-3xl" />
                <span v-if="specimen">Are you sure you want to delete the selected specimens?</span>
            </div>
            <template #footer>
                <Button label="No" icon="pi pi-times" text @click="deleteSpecimensDialog = false" />
                <Button label="Yes" icon="pi pi-check" text @click="deleteSelectedSpecimens" />
            </template>
        </Dialog>
</template>

<style scoped>
:deep(.p-datatable-tbody > tr > td) {
    padding-top: 0;
    padding-bottom: 0;
}
</style>
