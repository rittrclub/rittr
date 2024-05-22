<template>
  <UserList :users="users" />
</template>
<script setup>
import { $api } from "../helpers/api";
import useSWRV from "swrv";
import UserList from "./UserList.vue";
const { data: users } = useSWRV("newusers", $api.getNewUsers);
</script>
