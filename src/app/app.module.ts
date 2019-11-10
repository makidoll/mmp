import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { RouterModule, Routes } from "@angular/router";
import { AppComponent } from "./app.component";
import { MaterialModule } from "./material.module";
import { HeaderComponent } from "./header/header.component";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AlbumsComponent } from "./albums/albums.component";
import { WipComponent } from "./wip/wip.component";
import { HomeComponent } from "./home/home.component";
import { SongsComponent } from "./songs/songs.component";

const routes: Routes = [
	{ path: "", component: HomeComponent },
	{ path: "albums", component: AlbumsComponent },
	{ path: "artists", component: WipComponent },
	{ path: "songs", component: SongsComponent },
	{ path: "settings", component: WipComponent },
	{ path: "", pathMatch: "full", redirectTo: "/albums" },
	{ path: "**", redirectTo: "/" },
];

@NgModule({
	declarations: [
		AppComponent,
		HeaderComponent,
		AlbumsComponent,
		WipComponent,
		HomeComponent,
		SongsComponent,
	],
	imports: [
		BrowserModule,
		RouterModule.forRoot(routes),
		MaterialModule,
		BrowserAnimationsModule,
	],
	providers: [],
	bootstrap: [AppComponent],
})
export class AppModule {}
