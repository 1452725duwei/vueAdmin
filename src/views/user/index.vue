<template>
	<div class="app-container calendar-list-container">
		<el-button class="style1" type="primary" @click="dialogFormVisible = true">新增用户</el-button>
		<el-dialog title="新建用户" :visible.sync="dialogFormVisible">
			<el-form :model="form">
				<el-form-item label="用户名" :label-width="formLabelWidth">
					<el-input v-model="form.userName" auto-complete="off" placeholder="用户名"></el-input>
				</el-form-item>
				<el-form-item label="邮箱" :label-width="formLabelWidth">
					<el-input v-model="form.email" auto-complete="off" placeholder="邮箱"></el-input>
				</el-form-item>
				<el-form-item label="真名" :label-width="formLabelWidth">
					<el-input v-model="form.realName" auto-complete="off" placeholder="真名"></el-input>
				</el-form-item>
				<el-form-item label="全名" :label-width="formLabelWidth">
					<el-input v-model="form.fullName" auto-complete="off" placeholder="全名"></el-input>
				</el-form-item>
				<el-form-item label="手机号" :label-width="formLabelWidth">
					<el-input v-model="form.phoneNo" auto-complete="off" placeholder="手机号"></el-input>
				</el-form-item>
				<el-form-item label="角色" :label-width="formLabelWidth">
					<el-input v-model="form.roleIds" auto-complete="off" placeholder="角色"></el-input>
				</el-form-item>
				<el-form-item label="密码" :label-width="formLabelWidth">
					<el-input type="password" v-model="form.password" auto-complete="off" placeholder="密码"></el-input>
				</el-form-item>
			</el-form>
			<div slot="footer" class="dialog-footer">
				<el-button @click="dialogFormVisible = false">取 消</el-button>
				<el-button type="primary" @click="addUser()">确 定</el-button>
			</div>
		</el-dialog>
		<el-table :data="list" v-loading.body="listLoading" border fit highlight-current-row style="width: 100%">

			<el-table-column align="center" label="ID" width="80">
				<template slot-scope="scope">
					<span>{{scope.row.id}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="fullName" width="80">
				<template slot-scope="scope">
					<span>{{scope.row.fullName}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="email" width="80">
				<template slot-scope="scope">
					<span>{{scope.row.email}}</span>
				</template>
			</el-table-column>
			<el-table-column width="180px" align="center" label="phoneNo">
				<template slot-scope="scope">
					<span>{{scope.row.phoneNo}}</span>
				</template>
			</el-table-column>

			<el-table-column width="120px" align="center" label="realName">
				<template slot-scope="scope">
					<span>{{scope.row.realName}}</span>
				</template>
			</el-table-column>
			<el-table-column width="120px" align="center" label="roleIds">
				<template slot-scope="scope">
					<span>{{scope.row.roleIds}}</span>
				</template>
			</el-table-column>
			<el-table-column width="120px" align="center" label="userName">
				<template slot-scope="scope">
					<span>{{scope.row.userName}}</span>
				</template>
			</el-table-column>
			<el-table-column align="center" label="Actions" width="120">
				<template slot-scope="scope">
					<el-button v-if="scope.row.edit" type="success" @click="confirmEdit(scope.row)" size="small" icon="el-icon-circle-check-outline">Ok</el-button>
					<el-button v-else type="primary" @click='scope.row.edit=!scope.row.edit' size="small" icon="el-icon-edit">Edit</el-button>
				</template>
			</el-table-column>

		</el-table>
		<el-pagination background layout="prev, pager, next" :total="200">
		</el-pagination>

	</div>
</template>

<script>
	import {
		simplePostData,
		HOST_URL,
		generateUUID,
		isEmpty,
		generateSign,
		handleError,
		getNonce
	} from '@/utils/index.js'
	import {
		getPwdEncryptStr
	} from '@/utils/cryptoJS/encryptionUtil'
	export default {
		name: 'user',
		data() {
			return {
				list: null,
				listLoading: true,
				listQuery: {
					page: 4,
					limit: 10
				},
				centerDialogVisible: false,
				dialogFormVisible: false,
				form: {
					userNmae: '',
					emai: '',
					realName: '',
					fullName: '',
					phoneNo: '',
					roleIds: '',
					password: '',
				},
				formLabelWidth: '120px'
			}
		},
		filters: {
			statusFilter(status) {
				const statusMap = {
					published: 'success',
					draft: 'info',
					deleted: 'danger'
				}
				return statusMap[status]
			}
		},
		created() {
			
			this.getList()
		},
		methods: {
			getList() {
				this.listLoading = true
				let items = [];
				this.$http.get(HOST_URL + '/SCA/user/listAll').then(response => {
					items = response.body.pageData;
					this.list = items.map(v => {
						this.$set(v, 'edit', false) // https://vuejs.org/v2/guide/reactivity.html
						console.log(v);
						this.listLoading = false
						return v
					});
				});

			},
			cancelEdit(row) {
				row.title = row.originalTitle
				row.edit = false
				this.$message({
					message: 'The title has been restored to the original value',
					type: 'warning'
				})
			},
			confirmEdit(row) {
				row.edit = false
				row.originalTitle = row.title
				this.$message({
					message: 'The title has been edited',
					type: 'success'
				})
			},
			addUser() {
				this.dialogFormVisible = false;
				console.log(this.form.userName);
				console.log(this.form.realName);
				console.log(this.form.fullName);
				console.log(this.form.password);
				console.log(this.form.email);
				console.log(this.form.phoneNo);
				this.$http.post(HOST_URL + '/SCA/user', {
					"data": {
						userName: this.form.userName,
						userNameEncrypt: getPwdEncryptStr(this.form.userName),
						password: getPwdEncryptStr(this.form.password),
						realName:this.form.realName,
						fullName:this.form.fullName,
						email:this.form.email,
						phoneNo:this.form.phoneNo,
					}
				}).then(response => {
					console.log(response);
					this.loading = true;
					if(response.body.errorCode != 0)
					{
						handleError(response);
					}
				}, response => {
					console.log(error);
					handleError(response);
				});
			}
		}
	}
</script>

<style scoped>
	.style1 {
		margin-top: 20px;
		margin-bottom: 40px;
	}
	
	.edit-input {
		padding-right: 100px;
	}
	
	.cancel-btn {
		position: absolute;
		right: 15px;
		top: 10px;
	}
</style>