import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NzModalRef, NzMessageService, NzModalService, NzTreeNodeOptions } from 'ng-zorro-antd';
import { Department } from '../model/department';
import { Position } from '../model/position';
import { Employee } from '../model/employee';
import { EmployeeService } from 'src/app/services/employee.service';
import { PositionService } from 'src/app/services/position.service';

@Component({
  selector: 'app-employee',
  templateUrl: './employee.component.html',
  styleUrls: ['./employee.component.scss']
})
export class EmployeeComponent implements OnInit {

  data: Employee[] = [];

  size: number = 10;
  page: number = 1;
  total: number = 0;

  currentId?: number = null;

  @ViewChild('editTitleTpl', { static: true })
  editTitleTpl;

  @ViewChild('contentTpl', { static: true })
  contentTpl;

  editForm: FormGroup = new FormGroup({});
  searchForm: FormGroup = new FormGroup({});

  modal: NzModalRef;

  departmentNode: NzTreeNodeOptions[] = [];
  positionOptions: Position[] = [];

  constructor(
    private messageService: NzMessageService,
    private modalService: NzModalService,
    private formBuilder: FormBuilder,
    private employeeService: EmployeeService,
    private positionService: PositionService) { }

  ngOnInit(): void {
    this.positionService.getAll().subscribe((result: any) => {
      this.positionOptions = result;
    });
    this.searchForm = this.formBuilder.group({
      phoneNumber: [null],
      name: [null],
      position: [null]
    })
    this.refresh();
  }

  refresh(department = '') {
    this.employeeService.getEmployees(this.page, this.size,
      null,
      this.searchForm.value['phoneNumber'],
      this.searchForm.value['name'], department,
      this.searchForm.value['position'])
      .subscribe((result: any) => {
        this.data = result.data;
        this.total = result.count;
      });
  }

  edit(id) {
    this.employeeService.get(id).subscribe((result: any) => {
      this.currentId = id;
      this.editForm = this.formBuilder.group({
        name: [{ value: result['name'], disabled: true }],
        department: [result['departmentId']],
        positions: [result['positionIds']?.split(',')]
      });
      this.modal = this.modalService.create({
        nzTitle: this.editTitleTpl,
        nzContent: this.contentTpl,
        nzFooter: null,
      })
    });
  }

  submitSearch() {
    this.refresh();
  }

  submitEdit() {
    for (const i in this.editForm.controls) {
      this.editForm.controls[i].markAsDirty();
      this.editForm.controls[i].updateValueAndValidity();
    }
    if (this.editForm.valid) {
      let employee = new Employee()
      employee.id = this.currentId;
      employee.departmentId = this.editForm.value['department'];
      employee.positionIds = this.editForm.value['positions'].join(',');
      this.employeeService.updateEmployee(employee).subscribe(result => {
        this.messageService.success("修改成功！");
        this.refresh();
        this.modal.close();
      });
    }
  }

  cancel() {
    this.modal.close();
  }

  pageChange() {
    this.refresh();
  }

  sizeChange() {
    this.page = 1;
    this.refresh();
  }

  getImgUrl(name) {
    return `/assets/avatars/${name}.png`;
  }

  getPositionName(id) {
    return this.positionOptions.find(p => p.id.toString() == id)?.name;
  }

  selectedChanged(array: Department[]) {
  }


}
