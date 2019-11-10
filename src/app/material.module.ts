import {
	MdcButtonModule,
	MDCDataTableModule,
	MdcDrawerModule,
	MdcFabModule,
	MdcIconModule,
	MdcListModule,
	MdcSliderModule,
	MdcTopAppBarModule,
} from "@angular-mdc/web";
import { NgModule } from "@angular/core";

@NgModule({
	exports: [
		MdcButtonModule,
		MDCDataTableModule,
		MdcDrawerModule,
		MdcFabModule,
		MdcIconModule,
		MdcListModule,
		MdcSliderModule,
		MdcTopAppBarModule,
	],
})
export class MaterialModule {}
