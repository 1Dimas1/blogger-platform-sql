import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBasicAuth,
} from '@nestjs/swagger';
import { Constants } from '../../../../core/constants';
import { GetBlogsQueryParams } from './input-dto/get-blogs-query-params.input-dto';
import { PaginatedViewDto } from '../../../../core/dto/base.paginated.view-dto';
import { UpdateBlogInputDto } from './input-dto/update-blog.input-dto';
import { CreateBlogInputDto } from './input-dto/create-blog.input-dto';
import { BlogViewDto } from './view-dto/blogs.view-dto';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateBlogCommand } from '../application/usecases/create-blog.usecase';
import { UpdateBlogCommand } from '../application/usecases/update-blog.usecase';
import { DeleteBlogCommand } from '../application/usecases/delete-blog.usecase';
import { GetBlogByIdQuery } from '../application/queries/get-blog-by-id.query';
import { GetBlogsQuery } from '../application/queries/get-blogs.query';
import { CreatePostByBlogIdCommand } from '../../posts/application/usecases/create-post-by-blog-id.usecase';
import { GetPostByIdQuery } from '../../posts/application/queries/get-post-by-id.query';
import { GetPostsByBlogIdQuery } from '../../posts/application/queries/get-posts-by-blog-id.query';
import { GetPostsQueryParams } from '../../posts/api/input-dto/get-posts-query-params.input-dto';
import { PostViewDto } from '../../posts/api/view-dto/post.view-dto';
import { CreatePostByBlogIdInputDto } from '../../posts/api/input-dto/create-post.input-dto';
import { BasicAuthGuard } from '../../../user-accounts/guards/basic/basic-auth.guard';
import { JwtOptionalAuthGuard } from '../../../user-accounts/guards/bearer/jwt-optional-auth.guard';
import { ExtractUserIfExistsFromRequest } from '../../../user-accounts/guards/decorators/param/extract-user-if-exists-from-request.decorator';
import { UserContextDto } from '../../../user-accounts/guards/dto/user-context.dto';

@ApiTags('Blogs')
@Controller(Constants.PATH.BLOGS)
export class BlogsController {
  constructor(
    private commandBus: CommandBus,
    private queryBus: QueryBus,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Returns blogs with paging' })
  @ApiResponse({ status: 200, description: 'Success' })
  async getBlogs(
    @Query() query: GetBlogsQueryParams,
  ): Promise<PaginatedViewDto<BlogViewDto[]>> {
    return this.queryBus.execute<
      GetBlogsQuery,
      PaginatedViewDto<BlogViewDto[]>
    >(new GetBlogsQuery(query));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Returns blog by id' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async getBlogById(@Param('id') id: string): Promise<BlogViewDto> {
    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(id),
    );
  }

  @Get(':blogId/posts')
  @UseGuards(JwtOptionalAuthGuard)
  @ApiOperation({ summary: 'Returns all posts for specified blog' })
  @ApiResponse({ status: 200, description: 'Success' })
  @ApiResponse({
    status: 404,
    description: 'If specificied blog is not exists',
  })
  async getPostsByBlogId(
    @Param('blogId') blogId: string,
    @Query() query: GetPostsQueryParams,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PaginatedViewDto<PostViewDto[]>> {
    return this.queryBus.execute<
      GetPostsByBlogIdQuery,
      PaginatedViewDto<PostViewDto[]>
    >(new GetPostsByBlogIdQuery(blogId, query, user?.id ?? null));
  }

  @Post(':blogId/posts')
  @UseGuards(BasicAuthGuard, JwtOptionalAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create new post for specific blog' })
  @ApiResponse({ status: 201, description: 'Returns the newly created post' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: "If specified blog doesn't exists" })
  async createPostByBlogId(
    @Param('blogId') blogId: string,
    @Body() body: CreatePostByBlogIdInputDto,
    @ExtractUserIfExistsFromRequest() user: UserContextDto | null,
  ): Promise<PostViewDto> {
    const postId: string = await this.commandBus.execute<
      CreatePostByBlogIdCommand,
      string
    >(new CreatePostByBlogIdCommand(blogId, body));

    return this.queryBus.execute<GetPostByIdQuery, PostViewDto>(
      new GetPostByIdQuery(postId, user?.id ?? null),
    );
  }

  @Post()
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @ApiOperation({ summary: 'Create new blog' })
  @ApiResponse({ status: 201, description: 'Returns the newly created blog' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createBlog(@Body() body: CreateBlogInputDto): Promise<BlogViewDto> {
    const blogId: string = await this.commandBus.execute<
      CreateBlogCommand,
      string
    >(new CreateBlogCommand(body));

    return this.queryBus.execute<GetBlogByIdQuery, BlogViewDto>(
      new GetBlogByIdQuery(blogId),
    );
  }

  @Put(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Update existing Blog by id with InputModel' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({
    status: 400,
    description: 'If the inputModel has incorrect values',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async updateBlog(
    @Param('id') id: string,
    @Body() body: UpdateBlogInputDto,
  ): Promise<void> {
    return this.commandBus.execute(new UpdateBlogCommand(id, body));
  }

  @Delete(':id')
  @UseGuards(BasicAuthGuard)
  @ApiBasicAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete blog specified by id' })
  @ApiResponse({ status: 204, description: 'No Content' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Not Found' })
  async deleteBlog(@Param('id') id: string): Promise<void> {
    return this.commandBus.execute(new DeleteBlogCommand(id));
  }
}
