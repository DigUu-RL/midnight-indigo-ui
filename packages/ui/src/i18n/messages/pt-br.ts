// Brazilian Portuguese texts of the components, in the `midnight-indigo` namespace. Portuguese has a `many` plural
// category (millions), so every pluralized text has `many` as well.
import type { LibraryMessages } from '#src/i18n/library-messages.ts';

export const brazilianPortugueseMessages: LibraryMessages = {
	alert: {
		dismiss: 'Dispensar',
	},
	breadcrumbs: {
		navigation: 'Trilha de navegação',
		expand: {
			one: 'Mostrar mais {{count, number}} nível',
			many: 'Mostrar mais {{count, number}} de níveis',
			other: 'Mostrar mais {{count, number}} níveis',
		},
	},
	carousel: {
		carousel: 'carrossel',
		slide: 'slide',
		previous: 'Slide anterior',
		next: 'Próximo slide',
		slidePicker: 'Escolher um slide',
		slidePosition: '{{position}} de {{total}}',
	},
	combobox: {
		noOptions: 'Nenhuma opção',
		loading: 'Carregando opções',
		clear: 'Limpar',
		open: 'Mostrar opções',
		close: 'Ocultar opções',
		moreOptions:
			'Mostrando {{shown, number}} de {{total, number}} opções. Digite para filtrar a lista.',
	},
	confirmDialog: {
		confirm: 'Confirmar',
		cancel: 'Cancelar',
	},
	dataTable: {
		loading: 'Carregando linhas',
		empty: 'Nenhuma linha ainda',
		noResults: 'Nenhuma linha corresponde ao filtro',
		error: 'Não foi possível carregar as linhas',
		retry: 'Tentar novamente',
		sorted: {
			ascending: 'Ordenado por {{column}}, crescente',
			descending: 'Ordenado por {{column}}, decrescente',
		},
		rowRange: 'Linhas {{first, number}} a {{last, number}} de {{total, number}}',
		resultCount: {
			zero: 'Nenhuma linha',
			one: '{{count, number}} linha',
			many: '{{count, number}} de linhas',
			other: '{{count, number}} linhas',
		},
		pagination: 'Páginas de {{caption}}',
	},
	dialog: {
		close: 'Fechar',
	},
	drawer: {
		close: 'Fechar',
	},
	errorState: {
		retry: 'Tentar novamente',
	},
	errorSummary: {
		title: {
			one: 'Há {{count, number}} problema neste formulário',
			many: 'Há {{count, number}} de problemas neste formulário',
			other: 'Há {{count, number}} problemas neste formulário',
		},
	},
	fileUpload: {
		choose: {
			single: 'Escolher um arquivo',
			multiple: 'Escolher arquivos',
		},
		dropHint: 'ou solte-os aqui',
		acceptedTypes: 'Tipos aceitos: {{types}}.',
		maxSize: 'Até {{size}} cada.',
		maxFiles: {
			one: 'Até {{count, number}} arquivo.',
			many: 'Até {{count, number}} de arquivos.',
			other: 'Até {{count, number}} arquivos.',
		},
		remove: 'Remover {{fileName}}',
		fileList: 'Arquivos escolhidos',
		rejected: {
			type: '{{fileName}} não foi adicionado: este tipo não é aceito.',
			size: '{{fileName}} não foi adicionado: é maior que {{size}}.',
			count: {
				one: '{{fileName}} não foi adicionado: o limite é {{count, number}} arquivo.',
				many: '{{fileName}} não foi adicionado: o limite é {{count, number}} de arquivos.',
				other: '{{fileName}} não foi adicionado: o limite é {{count, number}} arquivos.',
			},
		},
	},
	form: {
		submissionError: 'Não foi possível enviar o formulário. Tente novamente.',
		constraint: {
			valueMissing: 'Preencha este campo.',
			badValue: 'Informe um valor válido.',
			tooShort: 'Informe um valor mais longo.',
			tooLong: 'Informe um valor mais curto.',
			rangeUnderflow: 'Informe um valor maior.',
			rangeOverflow: 'Informe um valor menor.',
			stepMismatch: 'Informe um valor permitido.',
			invalid: 'Revise este campo.',
		},
	},
	formField: {
		loading: 'Carregando',
	},
	link: {
		opensInNewTab: '(abre em nova aba)',
	},
	loadingStatus: {
		loading: 'Carregando',
	},
	numberField: {
		increment: 'Aumentar',
		decrement: 'Diminuir',
	},
	pagination: {
		navigation: 'Paginação',
		previous: 'Página anterior',
		next: 'Próxima página',
		page: 'Página {{page}}',
		status: 'Página {{page}} de {{pageCount}}',
	},
	passwordField: {
		showPassword: 'Mostrar senha',
	},
	searchField: {
		clear: 'Limpar pesquisa',
	},
	sidebar: {
		collapse: 'Recolher navegação',
		expand: 'Expandir navegação',
		close: 'Fechar navegação',
		open: 'Abrir navegação',
	},
	statCard: {
		up: 'Alta de',
		down: 'Queda de',
		flat: 'Sem variação',
		loading: 'Carregando',
	},
	textArea: {
		characterCount: {
			one: '{{count, number}} caractere',
			many: '{{count, number}} de caracteres',
			other: '{{count, number}} caracteres',
		},
		characterCountOfMaximum: {
			one: '{{current, number}} de {{count, number}} caractere',
			many: '{{current, number}} de {{count, number}} de caracteres',
			other: '{{current, number}} de {{count, number}} caracteres',
		},
	},
	toast: {
		region: 'Notificações',
		dismiss: 'Dispensar notificação',
	},
};
