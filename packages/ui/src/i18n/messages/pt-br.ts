// Brazilian Portuguese texts of the components, in the `midnight-indigo` namespace. Portuguese has a `many` plural
// category (millions), so every pluralized text has `many` as well.
import type { LibraryMessages } from '@/src/i18n/library-messages';

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
	chart: {
		loading: 'Carregando gráfico',
		empty: 'Nenhum dado para mostrar',
		error: 'Não foi possível carregar o gráfico',
		retry: 'Tentar novamente',
		stale: 'Estes dados podem estar desatualizados',
		legend: 'Séries',
		showTable: 'Mostrar tabela de dados',
		hideTable: 'Ocultar tabela de dados',
		category: 'Categoria',
		share: 'Participação',
		zoomIn: 'Aproximar',
		zoomOut: 'Afastar',
		resetZoom: 'Mostrar tudo',
		navigationHelp:
			'Use as setas para percorrer os pontos, e Home ou End para ir ao primeiro ou ao último.',
		zoomHelp: 'Pressione mais ou menos para aproximar ou afastar.',
		selectHelp: 'Pressione Enter para selecionar o ponto.',
		noValue: 'sem valor',
		seriesValue: '{{series}}: {{value}}',
		point: '{{category}}: {{values}} ({{position, number}} de {{total, number}})',
		categoryRange: {
			one: '{{count, number}} categoria: {{first}}.',
			many: '{{count, number}} de categorias, de {{first}} a {{last}}.',
			other: '{{count, number}} categorias, de {{first}} a {{last}}.',
		},
		seriesRange:
			'{{series}} vai de {{lowest}} ({{lowestCategory}}) a {{highest}} ({{highestCategory}}).',
		seriesNoValues: '{{series}} não tem valores.',
		slice: '{{category}}: {{value}} ({{share}}).',
		total: 'Total: {{value}}.',
		gauge: '{{value}}, numa escala de {{minimum}} a {{maximum}}.',
		zoomRange: 'Mostrando de {{first}} a {{last}}.',
	},
	codeBlock: {
		code: 'Código',
		files: 'Arquivos',
		copy: 'Copiar código',
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
	copyButton: {
		copy: 'Copiar',
		copied: 'Copiado',
		failed: 'Não foi possível copiar',
	},
	dashboardLayout: {
		skipToContent: 'Pular para o conteúdo principal',
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
	datePicker: {
		openCalendar: 'Escolher uma data',
		openTime: 'Escolher um horário',
		dialog: 'Calendário',
		rangeDialog: 'Escolher um período',
		timeDialog: 'Escolher um horário',
		previousMonth: 'Mostrar o mês anterior',
		nextMonth: 'Mostrar o próximo mês',
		month: 'Mês',
		year: 'Ano',
		presets: 'Períodos',
		today: 'Hoje',
		tomorrow: 'Amanhã',
		inDays: {
			one: 'Em {{count, number}} dia',
			many: 'Em {{count, number}} de dias',
			other: 'Em {{count, number}} dias',
		},
		nextDays: {
			one: 'Próximo {{count, number}} dia',
			many: 'Próximos {{count, number}} de dias',
			other: 'Próximos {{count, number}} dias',
		},
		thisMonth: 'Este mês',
		followingMonth: 'Próximo mês',
		followingQuarter: 'Próximo trimestre',
		followingYear: 'Próximo ano',
		clear: 'Limpar',
		cancel: 'Cancelar',
		apply: 'Aplicar',
		start: 'Início',
		end: 'Fim',
		rangeStart: 'início do período',
		rangeEnd: 'fim do período',
		hours: 'Horas',
		minutes: 'Minutos',
		meridiem: 'AM ou PM',
		dayPlaceholder: 'dd',
		monthPlaceholder: 'mm',
		yearPlaceholder: 'aaaa',
		hourPlaceholder: 'hh',
		minutePlaceholder: 'mm',
		invalid: 'Informe uma data que possa ser escolhida.',
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
	filterBar: {
		clear: 'Limpar filtros',
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
	tableOfContents: {
		title: 'Nesta página',
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
