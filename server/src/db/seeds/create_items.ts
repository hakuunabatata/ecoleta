import Knex from "knex";

export async function seed(knex: Knex) {
  const baseUrl = "http://192.168.100.3:3333/uploads/";
  await knex("items").insert([
    { title: "Lâmpadas", image: `${baseUrl}lampadas.svg` },
    { title: "Pilhas e Baterias", image: `${baseUrl}baterias.svg` },
    { title: "Papéis e Papelão", image: `${baseUrl}papeis-papelao.svg` },
    { title: "Resíduos Eletrônicos", image: `${baseUrl}eletronicos.svg` },
    { title: "Resíduos Orgânicos", image: `${baseUrl}organicos.svg` },
    { title: "Óleo de Cozinha", image: `${baseUrl}oleo.svg` },
  ]);
}
